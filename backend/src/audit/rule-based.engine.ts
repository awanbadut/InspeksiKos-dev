import { Injectable } from '@nestjs/common';
import { AuditRuleItem } from './entities/audit-rule-item.entity';
import { ConfidenceLevel } from './entities/audit-report.entity';

export interface BreakdownItem {
  facility: string;
  status: 'MATCH' | 'MISMATCH' | 'NEUTRAL';
  weight?: number;
  penalty?: number;
}

export interface AuditResult {
  score: number;
  confidenceLevel: ConfidenceLevel;
  breakdownData: Record<string, any>;
}

@Injectable()
export class RuleBasedEngine {
  execute(
    claimData: Record<string, any>,
    extractedData: Record<string, any>,
    technicalData: { tds_value: number; internet_speed: number },
    ruleItems: AuditRuleItem[],
    inspectorData?: Record<string, any>,
  ): AuditResult {
    let matchedWeight = 0;
    let totalWeight = 0;
    const breakdown: BreakdownItem[] = [];
    const evaluatedFacilities = new Set<string>();

    for (const item of ruleItems) {
      const facilityName = item.facility_name;
      evaluatedFacilities.add(facilityName);
      const claimed = claimData?.fasilitas?.[facilityName];

      // Check if this facility is claimed in the advertisement
      const isClaimed = claimed?.ada === true || claimed?.router_terlihat === true || claimed?.nilai !== undefined;

      if (isClaimed) {
        totalWeight += Number(item.weight);

        // Fetch actual values based on type of facility
        let actualVal: any;
        if (facilityName === 'kualitas_air' || facilityName === 'tds') {
          actualVal = { nilai: technicalData.tds_value };
        } else if (facilityName === 'kecepatan_internet' || facilityName === 'internet') {
          actualVal = { nilai: technicalData.internet_speed };
        } else {
          // Merge Gemini extraction with inspector manual evaluations
          const aiVal = extractedData?.fasilitas?.[facilityName];
          const inspectorVal = inspectorData?.fasilitas?.[facilityName];
          
          actualVal = {
            ada: aiVal?.ada === true || inspectorVal?.ada === true,
            router_terlihat: aiVal?.router_terlihat === true || inspectorVal?.router_terlihat === true,
            kondisi: aiVal?.kondisi || inspectorVal?.kondisi || 'baik',
          };
        }

        const match = this.compareAttribute(claimed, actualVal, item);

        if (match) {
          matchedWeight += Number(item.weight);
          breakdown.push({
            facility: facilityName,
            status: 'MATCH',
            weight: Number(item.weight),
          });
        } else {
          matchedWeight -= Number(item.penalty);
          breakdown.push({
            facility: facilityName,
            status: 'MISMATCH',
            penalty: Number(item.penalty),
          });
        }
      } else {
        breakdown.push({
          facility: facilityName,
          status: 'NEUTRAL',
        });
      }
    }

    // Process custom facilities dynamically
    if (claimData?.fasilitas) {
      Object.keys(claimData.fasilitas).forEach((facilityName) => {
        if (facilityName === 'kualitas_air' || facilityName === 'kecepatan_internet') return;

        if (!evaluatedFacilities.has(facilityName)) {
          const claimed = claimData.fasilitas[facilityName];
          const isClaimed = claimed?.ada === true || claimed?.router_terlihat === true;

          if (isClaimed) {
            const defaultWeight = 1.0;
            const defaultPenalty = 0.5;
            totalWeight += defaultWeight;

            const aiVal = extractedData?.fasilitas?.[facilityName];
            const inspectorVal = inspectorData?.fasilitas?.[facilityName];
            const actualAda = aiVal?.ada === true || aiVal?.router_terlihat === true || inspectorVal?.ada === true || inspectorVal?.router_terlihat === true;
            const match = actualAda === true;

            if (match) {
              matchedWeight += defaultWeight;
              breakdown.push({
                facility: facilityName,
                status: 'MATCH',
                weight: defaultWeight,
              });
            } else {
              matchedWeight -= defaultPenalty;
              breakdown.push({
                facility: facilityName,
                status: 'MISMATCH',
                penalty: defaultPenalty,
              });
            }
          }
        }
      });
    }

    const score = this.calculateScore(matchedWeight, totalWeight);
    const confidenceLevel = this.determineConfidenceLevel(score);
    const breakdownData = this.generateBreakdown(breakdown);

    return { score, confidenceLevel, breakdownData };
  }

  compareAttribute(claim: any, actual: any, item: AuditRuleItem): boolean {
    if (item.threshold_type === 'boolean') {
      // Standard boolean check
      const actualAda = actual?.ada === true || actual?.router_terlihat === true;
      return actualAda === true;
    }

    if (item.threshold_type === 'numeric' || item.threshold_type === 'range') {
      const val = Number(actual?.nilai || actual?.skor || 0);
      if (!item.threshold_value) return false;

      // Check if threshold is a range like "6-10" or "0-100"
      if (item.threshold_value.includes('-')) {
        const [min, max] = item.threshold_value.split('-').map(Number);
        return val >= min && val <= max;
      }

      // Check if it is a single numeric threshold (e.g. minimum value like "50" or "10")
      const thresholdNum = Number(item.threshold_value);
      
      // Special logic for TDS: lower is better (usually < 500 or < 150 mg/L)
      if (item.facility_name === 'kualitas_air' || item.facility_name === 'tds') {
        return val <= thresholdNum;
      }
      
      // For speed: higher is better
      return val >= thresholdNum;
    }

    return false;
  }

  calculateScore(matchedWeight: number, totalWeight: number): number {
    if (totalWeight <= 0) return 100;
    const score = (matchedWeight / totalWeight) * 100;
    // Bound score between 0 and 100
    const roundedScore = Math.max(0, Math.min(100, score));
    return Math.round(roundedScore * 100) / 100; // Round to 2 decimal places
  }

  determineConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= 95) return ConfidenceLevel.VALID;
    if (score >= 70) return ConfidenceLevel.PARTIAL_VALID;
    return ConfidenceLevel.FATAL_FRAUD;
  }

  generateBreakdown(breakdown: BreakdownItem[]): Record<string, any> {
    return {
      items: breakdown,
      total: breakdown.length,
      matched: breakdown.filter((b) => b.status === 'MATCH').length,
      mismatched: breakdown.filter((b) => b.status === 'MISMATCH').length,
      neutral: breakdown.filter((b) => b.status === 'NEUTRAL').length,
    };
  }
}
