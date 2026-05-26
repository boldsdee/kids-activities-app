/**
 * UK Bank Holidays (England & Wales) — pre-loaded for 2024–2027.
 * Updated annually as Gov.uk publishes them.
 * https://www.gov.uk/bank-holidays
 */
const UK_BANK_HOLIDAYS = new Set([
  // 2024
  '2024-01-01', // New Year's Day
  '2024-03-29', // Good Friday
  '2024-04-01', // Easter Monday
  '2024-05-06', // Early May Bank Holiday
  '2024-05-27', // Spring Bank Holiday
  '2024-08-26', // Summer Bank Holiday
  '2024-12-25', // Christmas Day
  '2024-12-26', // Boxing Day

  // 2025
  '2025-01-01', // New Year's Day
  '2025-04-18', // Good Friday
  '2025-04-21', // Easter Monday
  '2025-05-05', // Early May Bank Holiday
  '2025-05-26', // Spring Bank Holiday
  '2025-08-25', // Summer Bank Holiday
  '2025-12-25', // Christmas Day
  '2025-12-26', // Boxing Day

  // 2026
  '2026-01-01', // New Year's Day
  '2026-04-03', // Good Friday
  '2026-04-06', // Easter Monday
  '2026-05-04', // Early May Bank Holiday
  '2026-05-25', // Spring Bank Holiday
  '2026-08-31', // Summer Bank Holiday
  '2026-12-25', // Christmas Day
  '2026-12-28', // Boxing Day (substitute)

  // 2027
  '2027-01-01', // New Year's Day
  '2027-03-26', // Good Friday
  '2027-03-29', // Easter Monday
  '2027-05-03', // Early May Bank Holiday
  '2027-05-31', // Spring Bank Holiday
  '2027-08-30', // Summer Bank Holiday
  '2027-12-27', // Christmas Day (substitute)
  '2027-12-28', // Boxing Day (substitute)
]);

/** Returns true if the dateKey (YYYY-MM-DD) is a UK bank holiday */
export const isUKBankHoliday = (dateKey) => UK_BANK_HOLIDAYS.has(dateKey);

/** Returns true if an activity costs money (budgetGBP > 0) */
export const isPaidActivity = (activity) =>
  activity.budgetGBP !== undefined && activity.budgetGBP > 0;

/**
 * Returns true if paid activities are allowed on a given date.
 * Rules:
 *  - Saturday: always allowed
 *  - UK Bank Holiday: always allowed
 *  - Mon–Fri, Sunday: NOT allowed
 */
export const paidAllowedOnDate = (dateKey) => {
  if (isUKBankHoliday(dateKey)) return true;
  const dayOfWeek = new Date(dateKey + 'T12:00:00').getDay(); // 0=Sun, 6=Sat
  return dayOfWeek === 6; // Saturday only
};

/**
 * Filters an array of activities based on whether the date allows paid ones.
 */
export const filterActivitiesForDate = (activities, dateKey) => {
  if (paidAllowedOnDate(dateKey)) return activities;
  return activities.filter(a => !isPaidActivity(a));
};
