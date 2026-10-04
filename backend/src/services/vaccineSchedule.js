/**
 * Default National Immunization Schedule
 * Allows dynamic extension and configuration
 */
const DEFAULT_VACCINE_SCHEDULE = [
  {
    code: 'BIRTH_BCG',
    name: 'BCG',
    disease: 'Tuberculosis',
    dueAgeDays: 0,
    dueAgeLabel: 'At Birth (within 1 yr)',
    route: 'Intra-dermal',
    site: 'Left upper arm'
  },
  {
    code: 'BIRTH_OPV0',
    name: 'OPV-0',
    disease: 'Poliomyelitis',
    dueAgeDays: 0,
    dueAgeLabel: 'At Birth (within 15 days)',
    route: 'Oral (2 drops)',
    site: 'Oral'
  },
  {
    code: 'BIRTH_HEPB',
    name: 'Hepatitis B (Birth dose)',
    disease: 'Hepatitis B',
    dueAgeDays: 0,
    dueAgeLabel: 'At Birth (within 24 hrs)',
    route: 'Intra-muscular',
    site: 'Anterolateral side of mid-thigh'
  },
  {
    code: 'W6_OPV1',
    name: 'OPV-1',
    disease: 'Poliomyelitis',
    dueAgeDays: 42,
    dueAgeLabel: '6 Weeks',
    route: 'Oral (2 drops)',
    site: 'Oral'
  },
  {
    code: 'W6_PENTA1',
    name: 'Pentavalent-1',
    disease: 'Diphtheria, Pertussis, Tetanus, Hep B, Hib',
    dueAgeDays: 42,
    dueAgeLabel: '6 Weeks',
    route: 'Intra-muscular',
    site: 'Anterolateral side of mid-thigh'
  },
  {
    code: 'W6_ROTA1',
    name: 'Rotavirus-1',
    disease: 'Rotavirus Diarrhea',
    dueAgeDays: 42,
    dueAgeLabel: '6 Weeks',
    route: 'Oral (5 drops)',
    site: 'Oral'
  },
  {
    code: 'W6_IPV1',
    name: 'fIPV-1',
    disease: 'Poliomyelitis',
    dueAgeDays: 42,
    dueAgeLabel: '6 Weeks',
    route: 'Intra-dermal',
    site: 'Right upper arm'
  },
  {
    code: 'W6_PCV1',
    name: 'PCV-1',
    disease: 'Pneumococcal Disease',
    dueAgeDays: 42,
    dueAgeLabel: '6 Weeks',
    route: 'Intra-muscular',
    site: 'Anterolateral side of mid-thigh'
  },
  {
    code: 'W10_OPV2',
    name: 'OPV-2',
    disease: 'Poliomyelitis',
    dueAgeDays: 70,
    dueAgeLabel: '10 Weeks',
    route: 'Oral (2 drops)',
    site: 'Oral'
  },
  {
    code: 'W10_PENTA2',
    name: 'Pentavalent-2',
    disease: 'DPT + HepB + Hib',
    dueAgeDays: 70,
    dueAgeLabel: '10 Weeks',
    route: 'Intra-muscular',
    site: 'Anterolateral side of mid-thigh'
  },
  {
    code: 'W10_ROTA2',
    name: 'Rotavirus-2',
    disease: 'Rotavirus Diarrhea',
    dueAgeDays: 70,
    dueAgeLabel: '10 Weeks',
    route: 'Oral (5 drops)',
    site: 'Oral'
  },
  {
    code: 'W14_OPV3',
    name: 'OPV-3',
    disease: 'Poliomyelitis',
    dueAgeDays: 98,
    dueAgeLabel: '14 Weeks',
    route: 'Oral (2 drops)',
    site: 'Oral'
  },
  {
    code: 'W14_PENTA3',
    name: 'Pentavalent-3',
    disease: 'DPT + HepB + Hib',
    dueAgeDays: 98,
    dueAgeLabel: '14 Weeks',
    route: 'Intra-muscular',
    site: 'Anterolateral side of mid-thigh'
  },
  {
    code: 'W14_ROTA3',
    name: 'Rotavirus-3',
    disease: 'Rotavirus Diarrhea',
    dueAgeDays: 98,
    dueAgeLabel: '14 Weeks',
    route: 'Oral (5 drops)',
    site: 'Oral'
  },
  {
    code: 'W14_PCV2',
    name: 'PCV-2',
    disease: 'Pneumococcal Disease',
    dueAgeDays: 98,
    dueAgeLabel: '14 Weeks',
    route: 'Intra-muscular',
    site: 'Anterolateral side of mid-thigh'
  },
  {
    code: 'M9_MR1',
    name: 'MR-1 (Measles-Rubella)',
    disease: 'Measles & Rubella',
    dueAgeDays: 270,
    dueAgeLabel: '9-12 Months',
    route: 'Subcutaneous',
    site: 'Right upper arm'
  },
  {
    code: 'M9_VITA1',
    name: 'Vitamin A (1st Dose)',
    disease: 'Vitamin A Deficiency',
    dueAgeDays: 270,
    dueAgeLabel: '9-12 Months',
    route: 'Oral (1 ml - 1 lakh IU)',
    site: 'Oral'
  },
  {
    code: 'M9_PCV_BOOSTER',
    name: 'PCV Booster',
    disease: 'Pneumococcal Disease',
    dueAgeDays: 270,
    dueAgeLabel: '9-12 Months',
    route: 'Intra-muscular',
    site: 'Anterolateral side of mid-thigh'
  },
  {
    code: 'M16_MR2',
    name: 'MR-2',
    disease: 'Measles & Rubella',
    dueAgeDays: 480,
    dueAgeLabel: '16-24 Months',
    route: 'Subcutaneous',
    site: 'Right upper arm'
  },
  {
    code: 'M16_DPT_B1',
    name: 'DPT Booster-1',
    disease: 'Diphtheria, Pertussis, Tetanus',
    dueAgeDays: 480,
    dueAgeLabel: '16-24 Months',
    route: 'Intra-muscular',
    site: 'Anterolateral side of mid-thigh'
  },
  {
    code: 'M16_OPV_BOOSTER',
    name: 'OPV Booster',
    disease: 'Poliomyelitis',
    dueAgeDays: 480,
    dueAgeLabel: '16-24 Months',
    route: 'Oral (2 drops)',
    site: 'Oral'
  },
  {
    code: 'Y5_DPT_B2',
    name: 'DPT Booster-2',
    disease: 'Diphtheria, Pertussis, Tetanus',
    dueAgeDays: 1825,
    dueAgeLabel: '5-6 Years',
    route: 'Intra-muscular',
    site: 'Left upper arm'
  }
];

/**
 * Generates personalized vaccination schedule for a child based on Date of Birth
 * @param {string|Date} dob 
 * @param {Array} completedVaccines Array of { vaccineCode, givenDate, batchNo, givenBy }
 * @param {Array} customSchedule Optional admin-customized schedule
 * @returns {Array} List of evaluated vaccine items with status
 */
function generateChildVaccineSchedule(dob, completedVaccines = [], customSchedule = null) {
  const birthDate = new Date(dob);
  const today = new Date();
  const schedule = customSchedule && customSchedule.length > 0 ? customSchedule : DEFAULT_VACCINE_SCHEDULE;

  if (isNaN(birthDate.getTime())) return [];

  const completedMap = new Map();
  completedVaccines.forEach(v => {
    completedMap.set(v.vaccineCode, v);
  });

  return schedule.map(vaccine => {
    const dueDate = new Date(birthDate.getTime() + vaccine.dueAgeDays * 24 * 60 * 60 * 1000);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    const diffDaysFromDue = Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));

    const completedRecord = completedMap.get(vaccine.code);

    let status = 'UPCOMING';
    if (completedRecord) {
      status = 'COMPLETED';
    } else if (diffDaysFromDue > 14) {
      status = 'OVERDUE';
    } else if (diffDaysFromDue >= -7 && diffDaysFromDue <= 14) {
      status = 'DUE';
    } else if (diffDaysFromDue < -7) {
      status = 'UPCOMING';
    }

    return {
      ...vaccine,
      dueDate: dueDateStr,
      status,
      completedDate: completedRecord ? completedRecord.givenDate : null,
      batchNo: completedRecord ? completedRecord.batchNo : null,
      remarks: completedRecord ? completedRecord.remarks : null
    };
  });
}

module.exports = {
  DEFAULT_VACCINE_SCHEDULE,
  generateChildVaccineSchedule
};
