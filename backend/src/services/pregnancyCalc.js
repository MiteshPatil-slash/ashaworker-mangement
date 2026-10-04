const { RISK_FLAGS } = require('../config/constants');

/**
 * Calculates Expected Delivery Date (EDD) using Naegele's rule (LMP + 280 days)
 * @param {string|Date} lmpDate 
 * @returns {string} ISO Date string for EDD
 */
function calculateEDD(lmpDate) {
  const lmp = new Date(lmpDate);
  if (isNaN(lmp.getTime())) return null;
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return edd.toISOString().split('T')[0];
}

/**
 * Calculates current gestational age in weeks and days
 * @param {string|Date} lmpDate 
 * @returns {{ weeks: number, days: number, totalDays: number, trimester: string, stage: string }}
 */
function calculateGestationalAge(lmpDate) {
  const lmp = new Date(lmpDate);
  const today = new Date();
  if (isNaN(lmp.getTime())) return { weeks: 0, days: 0, totalDays: 0, trimester: 'Unknown', stage: 'Unknown' };

  const diffTime = today.getTime() - lmp.getTime();
  const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  let trimester = 'First Trimester (Weeks 1-12)';
  let stage = 'Early Pregnancy';

  if (weeks >= 28) {
    trimester = 'Third Trimester (Weeks 28-40+)';
    stage = 'Late Pregnancy / Delivery Preparation';
  } else if (weeks >= 13) {
    trimester = 'Second Trimester (Weeks 13-27)';
    stage = 'Mid Pregnancy Growth';
  }

  return { weeks, days, totalDays, trimester, stage };
}

/**
 * Evaluates administrative and clinical-protocol risk flags based on standard protocol rules
 * NOTE: This is an administrative protocol alert and NOT an automated clinical/AI diagnosis.
 * @param {object} healthData 
 * @returns {{ riskLevel: string, reasons: string[], disclaimer: string }}
 */
function evaluatePregnancyRisk(healthData = {}) {
  const reasons = [];
  const {
    systolicBP,
    diastolicBP,
    hemoglobin,
    hasBleeding,
    hasSevereHeadache,
    hasBlurredVision,
    hasSwelling,
    hasDecreasedFetalMovement,
    age,
    previousCSection,
    gravida
  } = healthData;

  // High Priority Rule Checks
  if (systolicBP >= 140 || diastolicBP >= 90) {
    reasons.push('Elevated Blood Pressure (>= 140/90 mmHg)');
  }
  if (hemoglobin !== undefined && hemoglobin < 7) {
    reasons.push('Severe Anemia (Hb < 7 g/dL)');
  }
  if (hasBleeding) {
    reasons.push('Vaginal Bleeding Reported');
  }
  if (hasSevereHeadache || hasBlurredVision) {
    reasons.push('Symptoms of Pre-eclampsia (Severe headache/blurred vision)');
  }
  if (hasDecreasedFetalMovement) {
    reasons.push('Reduced/Decreased Fetal Movement');
  }

  if (reasons.length > 0) {
    return {
      riskLevel: RISK_FLAGS.HIGH_PRIORITY,
      reasons,
      disclaimer: 'Administrative alert based on national maternal healthcare guidelines. Prompt medical consultation recommended.'
    };
  }

  // Needs Follow-up Checks
  if (hemoglobin !== undefined && hemoglobin >= 7 && hemoglobin < 11) {
    reasons.push('Moderate Anemia (Hb 7-10.9 g/dL) - Needs IFA tracking');
  }
  if (hasSwelling) {
    reasons.push('Pedal Edema/Swelling present');
  }
  if (age < 18 || age > 35) {
    reasons.push('Maternal age factor (<18 or >35 years)');
  }
  if (previousCSection) {
    reasons.push('Previous Caesarean Section history');
  }
  if (gravida > 4) {
    reasons.push('High parity (Gravida > 4)');
  }

  if (reasons.length > 0) {
    return {
      riskLevel: RISK_FLAGS.NEEDS_FOLLOW_UP,
      reasons,
      disclaimer: 'Administrative follow-up guideline. Schedule routine monitoring.'
    };
  }

  return {
    riskLevel: RISK_FLAGS.NORMAL,
    reasons: ['Standard routine maternal protocol'],
    disclaimer: 'All recorded indicators within standard administrative guidelines.'
  };
}

/**
 * Generates recommended ANC schedule for pregnancy
 * @param {string|Date} lmpDate 
 * @returns {Array} List of scheduled ANC milestones
 */
function generateANCSchedule(lmpDate) {
  const lmp = new Date(lmpDate);
  if (isNaN(lmp.getTime())) return [];

  const addWeeks = (w) => {
    const d = new Date(lmp.getTime() + w * 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      code: 'ANC_1',
      name: 'ANC Check-up 1 (Registration & First Trimester)',
      recommendedWeeks: 'Within 12 weeks',
      dueDate: addWeeks(10),
      focus: 'Confirmation, TT/Td 1, IFA initiation, baseline Hb & urine tests'
    },
    {
      code: 'ANC_2',
      name: 'ANC Check-up 2 (Second Trimester)',
      recommendedWeeks: '14 - 26 weeks',
      dueDate: addWeeks(20),
      focus: 'TT/Td 2 or booster, USG scan, BP & weight check, IFA continuation'
    },
    {
      code: 'ANC_3',
      name: 'ANC Check-up 3 (Third Trimester)',
      recommendedWeeks: '28 - 34 weeks',
      dueDate: addWeeks(32),
      focus: 'Fetal growth, BP, Anemia check, Calcium/IFA, birth preparedness'
    },
    {
      code: 'ANC_4',
      name: 'ANC Check-up 4 (Pre-Delivery Preparation)',
      recommendedWeeks: '36 weeks to delivery',
      dueDate: addWeeks(36),
      focus: 'Fetal position, institutional delivery planning, emergency transport arrangements'
    }
  ];
}

module.exports = {
  calculateEDD,
  calculateGestationalAge,
  evaluatePregnancyRisk,
  generateANCSchedule
};
