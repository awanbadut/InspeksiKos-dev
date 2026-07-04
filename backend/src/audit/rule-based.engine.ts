import { Injectable } from '@nestjs/common';
import { AuditRuleItem } from './entities/audit-rule-item.entity';
import { ConfidenceLevel } from './entities/audit-report.entity';

export interface BreakdownItem {
  facility: string;
  status: 'MATCH' | 'MISMATCH' | 'NEUTRAL';
  weight?: number;
  penalty?: number;
  claimed?: string;
  actual?: string;
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
        
        const aiVal = extractedData?.fasilitas?.[facilityName];
        const inspectorVal = inspectorData?.fasilitas?.[facilityName];

        // Fetch actual values based on type of facility
        let actualVal: any;
        if (facilityName === 'kualitas_air' || facilityName === 'tds') {
          actualVal = { nilai: technicalData.tds_value };
        } else if (facilityName === 'kecepatan_internet' || facilityName === 'internet') {
          actualVal = { nilai: technicalData.internet_speed };
        } else {
          const hasAiAda = aiVal?.ada === true;
          const hasInspectorAda = inspectorVal ? inspectorVal.ada === true : true;
          
          const hasAiWifi = aiVal?.router_terlihat === true;
          const hasInspectorWifi = inspectorVal ? inspectorVal.router_terlihat === true : true;

          actualVal = {
            ada: hasAiAda && hasInspectorAda,
            router_terlihat: hasAiWifi && hasInspectorWifi,
            kondisi: aiVal?.kondisi || inspectorVal?.kondisi || 'baik',
          };
        }

        const match = this.compareAttribute(claimed, actualVal, item);

        // Construct human-readable labels
        let claimedText = '';
        let actualText = '';
        
        if (facilityName === 'kualitas_air' || facilityName === 'tds') {
          claimedText = claimed?.nilai ? `<= ${claimed.nilai} mg/L` : 'Ada';
          actualText = `${technicalData.tds_value} mg/L`;
        } else if (facilityName === 'kecepatan_internet' || facilityName === 'internet') {
          claimedText = claimed?.nilai ? `>= ${claimed.nilai} Mbps` : 'Ada';
          actualText = `${technicalData.internet_speed} Mbps`;
        } else {
          claimedText = claimed?.ada === true || claimed?.router_terlihat === true ? 'Ada' : 'Tidak Ada';
          
          const aiAda = aiVal?.ada === true || aiVal?.router_terlihat === true;
          const inspectorAda = inspectorVal ? (inspectorVal.ada === true || inspectorVal.router_terlihat === true) : true;
          
          if (aiAda && inspectorAda) {
            actualText = 'Ada (Terverifikasi)';
          } else if (inspectorAda && !aiAda) {
            actualText = 'Tidak Terdeteksi AI (Foto Tidak Sesuai)';
          } else if (!inspectorAda && aiAda) {
            actualText = 'Tidak Ada (Hasil Verifikator Lapangan)';
          } else {
            actualText = 'Tidak Ada';
          }
        }

        if (match) {
          matchedWeight += Number(item.weight);
          breakdown.push({
            facility: facilityName,
            status: 'MATCH',
            weight: Number(item.weight),
            claimed: claimedText,
            actual: actualText,
          });
        } else {
          matchedWeight -= Number(item.penalty);
          breakdown.push({
            facility: facilityName,
            status: 'MISMATCH',
            penalty: Number(item.penalty),
            claimed: claimedText,
            actual: actualText,
          });
        }
      } else {
        breakdown.push({
          facility: facilityName,
          status: 'NEUTRAL',
          claimed: 'Tidak Diklaim',
          actual: '-',
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
            
            const hasAiCustom = aiVal?.ada === true || aiVal?.router_terlihat === true;
            const hasInspectorCustom = inspectorVal ? (inspectorVal.ada === true || inspectorVal.router_terlihat === true) : true;
            
            const actualAda = hasAiCustom && hasInspectorCustom;
            const match = actualAda === true;

            const claimedText = claimed?.ada === true || claimed?.router_terlihat === true ? 'Ada' : 'Tidak Ada';
            
            let actualText = '';
            if (hasAiCustom && hasInspectorCustom) {
              actualText = 'Ada (Terverifikasi)';
            } else if (hasInspectorCustom && !hasAiCustom) {
              actualText = 'Tidak Terdeteksi AI (Foto Tidak Sesuai)';
            } else if (!hasInspectorCustom && hasAiCustom) {
              actualText = 'Tidak Ada (Hasil Verifikator Lapangan)';
            } else {
              actualText = 'Tidak Ada';
            }

            if (match) {
              matchedWeight += defaultWeight;
              breakdown.push({
                facility: facilityName,
                status: 'MATCH',
                weight: defaultWeight,
                claimed: claimedText,
                actual: actualText,
              });
            } else {
              matchedWeight -= defaultPenalty;
              breakdown.push({
                facility: facilityName,
                status: 'MISMATCH',
                penalty: defaultPenalty,
                claimed: claimedText,
                actual: actualText,
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
