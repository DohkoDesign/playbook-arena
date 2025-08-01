import { VODReviewView } from "./VODReviewView";

interface MatchAnalysisViewProps {
  teamId: string;
  gameType: string;
}

export const MatchAnalysisView = ({ teamId, gameType }: MatchAnalysisViewProps) => {
  return (
    <VODReviewView teamId={teamId} gameType={gameType} />
  );
};