const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getCurrentStreak = (solvedDates) => {
  if (!solvedDates.length) return 0;
  const dayMap = new Set(solvedDates.map((d) => startOfDay(d).getTime()));
  let streak = 0;
  let cursor = startOfDay(new Date());
  while (dayMap.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

module.exports = { startOfDay, getCurrentStreak };
