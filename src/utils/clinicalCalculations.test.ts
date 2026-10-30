import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBedOccupancy,
  calculateMNAScore,
  verifyClosedLoopMatch,
  getSeverityStyle,
  BedItem,
} from './clinicalCalculations';

test('calculateBedOccupancy computes correct occupancy rate and counts', () => {
  const beds: BedItem[] = [
    { id: '1', roomName: 'Ruang Melati', bedNumber: 'A01', status: 'occupied', severity: 'stable' },
    { id: '2', roomName: 'Ruang Melati', bedNumber: 'A02', status: 'vacant' },
    { id: '3', roomName: 'Ruang Melati', bedNumber: 'A03', status: 'occupied', severity: 'critical' },
    { id: '4', roomName: 'Ruang Melati', bedNumber: 'A04', status: 'maintenance' },
  ];

  const result = calculateBedOccupancy(beds);
  assert.equal(result.totalBeds, 4);
  assert.equal(result.occupiedBeds, 2);
  assert.equal(result.availableBeds, 1);
  assert.equal(result.maintenanceBeds, 1);
  assert.equal(result.occupancyRate, 50.0);
});

test('calculateBedOccupancy handles empty list safely', () => {
  const result = calculateBedOccupancy([]);
  assert.equal(result.totalBeds, 0);
  assert.equal(result.occupancyRate, 0);
});

test('calculateMNAScore evaluates normal, risk, and malnourished states accurately', () => {
  // Score 13 -> Normal (>= 12)
  const normal = calculateMNAScore({
    foodIntakeDecline: 2,
    weightLossRecent: 3,
    mobility: 2,
    psychologicalStress: 2,
    neuropsychological: 2,
    bmiScore: 2,
  });
  assert.equal(normal.score, 13);
  assert.equal(normal.category, 'Normal');

  // Score 9 -> Risiko Malnutrisi (8-11)
  const atRisk = calculateMNAScore({
    foodIntakeDecline: 1,
    weightLossRecent: 2,
    mobility: 1,
    psychologicalStress: 2,
    neuropsychological: 1,
    bmiScore: 2,
  });
  assert.equal(atRisk.score, 9);
  assert.equal(atRisk.category, 'Risiko Malnutrisi');

  // Score 5 -> Malnutrisi (0-7)
  const malnourished = calculateMNAScore({
    foodIntakeDecline: 0,
    weightLossRecent: 1,
    mobility: 0,
    psychologicalStress: 0,
    neuropsychological: 1,
    bmiScore: 1,
  });
  assert.equal(malnourished.score, 3);
  assert.equal(malnourished.category, 'Malnutrisi');
});

test('verifyClosedLoopMatch rejects wrong patient wristband', () => {
  const result = verifyClosedLoopMatch('PT-VERA-001', 'PT-VERA-999');
  assert.equal(result.isValid, false);
  assert.equal(result.errorCode, 'WRONG_PATIENT');
});

test('verifyClosedLoopMatch rejects wrong item recipient even if wristband matches', () => {
  const result = verifyClosedLoopMatch('PT-VERA-001', 'PT-VERA-001', 'PT-VERA-002');
  assert.equal(result.isValid, false);
  assert.equal(result.errorCode, 'WRONG_ITEM_RECIPIENT');
});

test('verifyClosedLoopMatch approves valid closed loop transaction', () => {
  const result = verifyClosedLoopMatch('PT-VERA-001', 'PT-VERA-001', 'PT-VERA-001');
  assert.equal(result.isValid, true);
  assert.equal(result.errorCode, 'NONE');
});

test('getSeverityStyle maps colors according to mandatory clinical color guidelines', () => {
  assert.equal(getSeverityStyle('critical').color, '#7F1D1D');
  assert.equal(getSeverityStyle('severe').color, '#DC2626');
  assert.equal(getSeverityStyle('moderate').color, '#FACC15');
  assert.equal(getSeverityStyle('stable').color, '#16A34A');
});
