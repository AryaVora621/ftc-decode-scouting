import { MatchEntry, TeamSummary, AutoReliability } from './types';

const reliabilityMap: Record<AutoReliability, number> = { low: 1, medium: 2, high: 3 };

export function computeTeamSummaries(entries: MatchEntry[]): TeamSummary[] {
  const grouped: Record<number, MatchEntry[]> = {};
  entries.forEach(e => {
    if (!grouped[e.teamNumber]) grouped[e.teamNumber] = [];
    grouped[e.teamNumber].push(e);
  });

  return Object.entries(grouped).map(([tn, matches]) => {
    const n = matches.length;
    const avgAuto = matches.reduce((s, m) => s + m.autoScore, 0) / n;
    const avgTeleop = matches.reduce((s, m) => s + m.teleopScore, 0) / n;
    const avgEndgame = matches.reduce((s, m) => s + m.endgameScore, 0) / n;
    const avgTotal = matches.reduce((s, m) => s + m.totalScore, 0) / n;
    const parkSuccess = matches.filter(m => m.parkStatus === 'full').length / n;
    const autoRel = matches.reduce((s, m) => s + reliabilityMap[m.autoReliability], 0) / n;
    const patternRate = matches.filter(m => m.patternGood).length / n;

    // Contribution Rating (sOPR-like)
    const cr = (avgAuto * 1.5) + (avgTeleop * 1.0) + (avgEndgame * 1.2) +
      (patternRate * 5) + (parkSuccess * 3) + ((autoRel / 3) * 4);

    // Reliability Index (0-100)
    const ri = ((autoRel / 3) * 40) + (patternRate * 30) + (parkSuccess * 30);

    return {
      teamNumber: Number(tn),
      matchCount: n,
      avgAutoScore: Math.round(avgAuto * 10) / 10,
      avgTeleopScore: Math.round(avgTeleop * 10) / 10,
      avgTotalScore: Math.round(avgTotal * 10) / 10,
      avgEndgameScore: Math.round(avgEndgame * 10) / 10,
      parkSuccessRate: Math.round(parkSuccess * 100),
      autoReliabilityScore: Math.round(autoRel * 100) / 100,
      patternSuccessRate: Math.round(patternRate * 100),
      contributionRating: Math.round(cr * 10) / 10,
      reliabilityIndex: Math.round(ri),
    };
  }).sort((a, b) => b.contributionRating - a.contributionRating);
}
