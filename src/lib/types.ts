export type AllianceColor = 'red' | 'blue';
export type ParkStatus = 'none' | 'partial' | 'full';
export type AutoReliability = 'low' | 'medium' | 'high';
export type CycleStyle = 'ground' | 'feeder' | 'both';

export interface MatchEntry {
  id: string;
  teamNumber: number;
  matchNumber: number;
  allianceColor: AllianceColor;
  scoutName: string;
  timestamp: string;
  // Auto
  autoScore: number;
  autoLeave: boolean;
  autoReliability: AutoReliability;
  patternGood: boolean;
  autoPathJson: { x: number; y: number }[];
  // Teleop
  teleopScore: number;
  cycleStyle: CycleStyle;
  humanPlayerNotes: string;
  // Endgame
  parkStatus: ParkStatus;
  endgameScore: number;
  // Notes
  generalNotes: string;
  // Computed
  totalScore: number;
}

export interface PitEntry {
  id: string;
  teamNumber: number;
  timestamp: string;
  autoCapacity: number;
  teleopCapacity: number;
  parkStatus: ParkStatus;
  autoReliability: AutoReliability;
  patternGood: boolean;
  cycleStyle: CycleStyle;
  humanPlayerNotes: string;
  generalNotes: string;
  autoPathJson: { x: number; y: number }[];
}

export interface TeamSummary {
  teamNumber: number;
  matchCount: number;
  avgAutoScore: number;
  avgTeleopScore: number;
  avgTotalScore: number;
  parkSuccessRate: number;
  autoReliabilityScore: number;
  patternSuccessRate: number;
  avgEndgameScore: number;
  contributionRating: number;
  reliabilityIndex: number;
}
