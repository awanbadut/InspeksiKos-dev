import { RuleBasedEngine } from './rule-based.engine';
import { AuditRuleItem } from './entities/audit-rule-item.entity';
import { ConfidenceLevel } from './entities/audit-report.entity';

describe('RuleBasedEngine', () => {
  let engine: RuleBasedEngine;

  beforeEach(() => {
    engine = new RuleBasedEngine();
  });

  const mockRuleItems: AuditRuleItem[] = [
    {
      item_id: '1',
      facility_name: 'wifi',
      weight: 1.0,
      penalty: 0.5,
      threshold_type: 'boolean',
      threshold_value: '',
      rule_id: 'r1',
      auditRule: null,
    } as AuditRuleItem,
    {
      item_id: '2',
      facility_name: 'kualitas_air',
      weight: 1.5,
      penalty: 1.0,
      threshold_type: 'numeric',
      threshold_value: '300', // TDS lower than 300 is clean air
      rule_id: 'r1',
      auditRule: null,
    } as AuditRuleItem,
    {
      item_id: '3',
      facility_name: 'kecepatan_internet',
      weight: 1.5,
      penalty: 0.8,
      threshold_type: 'numeric',
      threshold_value: '20', // Internet higher than 20 Mbps is fast
      rule_id: 'r1',
      auditRule: null,
    } as AuditRuleItem,
    {
      item_id: '4',
      facility_name: 'kasur_springbed',
      weight: 1.0,
      penalty: 0.5,
      threshold_type: 'boolean',
      threshold_value: '',
      rule_id: 'r1',
      auditRule: null,
    } as AuditRuleItem,
  ];

  it('should return 100% VALID score if all claimed facilities match actual values', () => {
    const claimData = {
      fasilitas: {
        wifi: { ada: true, router_terlihat: true },
        kualitas_air: { nilai: 150 },
        kecepatan_internet: { nilai: 25 },
        kasur_springbed: { ada: true },
      },
    };

    const extractedData = {
      fasilitas: {
        wifi: { ada: true, router_terlihat: true },
        kasur_springbed: { ada: true },
      },
    };

    const technicalData = {
      tds_value: 120, // Clean (< 300)
      internet_speed: 30, // Fast (>= 20)
    };

    const result = engine.execute(claimData, extractedData, technicalData, mockRuleItems);

    expect(result.score).toBe(100);
    expect(result.confidenceLevel).toBe(ConfidenceLevel.VALID);
    expect(result.breakdownData.matched).toBe(4);
    expect(result.breakdownData.mismatched).toBe(0);
  });

  it('should return FATAL_FRAUD and apply penalties if facilities do not match claims', () => {
    const claimData = {
      fasilitas: {
        wifi: { ada: true },
        kualitas_air: { nilai: 150 },
        kecepatan_internet: { nilai: 25 },
        kasur_springbed: { ada: true },
      },
    };

    const extractedData = {
      fasilitas: {
        wifi: { ada: false }, // Mismatch
        kasur_springbed: { ada: false }, // Mismatch
      },
    };

    const technicalData = {
      tds_value: 400, // Dirty (> 300) - Mismatch
      internet_speed: 10, // Slow (< 20) - Mismatch
    };

    const result = engine.execute(claimData, extractedData, technicalData, mockRuleItems);

    // Sum of weights = 1.0 (wifi) + 1.5 (air) + 1.5 (net) + 1.0 (kasur) = 5.0
    // Penaltys applied: -0.5 (wifi) - 1.0 (air) - 0.8 (net) - 0.5 (kasur) = -2.8
    // Score = -2.8 / 5.0 * 100 = -56%, bounded to 0
    expect(result.score).toBe(0);
    expect(result.confidenceLevel).toBe(ConfidenceLevel.FATAL_FRAUD);
    expect(result.breakdownData.matched).toBe(0);
    expect(result.breakdownData.mismatched).toBe(4);
  });

  it('should ignore neutral facilities that are not claimed in the advertisement', () => {
    const claimData = {
      fasilitas: {
        wifi: { ada: true },
        // kualitas_air, kecepatan_internet, and kasur_springbed are not claimed
      },
    };

    const extractedData = {
      fasilitas: {
        wifi: { ada: true },
      },
    };

    const technicalData = {
      tds_value: 120,
      internet_speed: 30,
    };

    const result = engine.execute(claimData, extractedData, technicalData, mockRuleItems);

    // Only wifi is claimed, weight = 1.0. Matched = 1.0.
    // Score = 1.0 / 1.0 * 100 = 100
    expect(result.score).toBe(100);
    expect(result.confidenceLevel).toBe(ConfidenceLevel.VALID);
    expect(result.breakdownData.matched).toBe(1);
    expect(result.breakdownData.neutral).toBe(3);
  });
});
