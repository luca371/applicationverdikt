export const RANKS = [
  { days: 0,   label: 'Aspirant',           color: '#6b7280' },
  { days: 7,   label: 'Locotenent',         color: '#3b82f6' },
  { days: 30,  label: 'Capitan Locotenent', color: '#2563eb' },
  { days: 90,  label: 'Capitan',            color: '#7c3aed' },
  { days: 180, label: 'Amiral',             color: '#c8a96e' },
  { days: 365, label: 'Maresalul',          color: '#dc2626' },
  { days: 548, label: 'Gigea',              color: '#0d0d0d', easter: true },
];

export function getRank(streak) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (streak >= r.days) rank = r; }
  return rank;
}

export function getNextRank(streak) {
  for (const r of RANKS) { if (streak < r.days) return r; }
  return null;
}

export function getRankIdx(streak) {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) { if (streak >= RANKS[i].days) idx = i; }
  return idx;
}