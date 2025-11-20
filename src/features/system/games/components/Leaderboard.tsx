import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

/**
 * Leaderboard Component
 * Displays top scores for the game
 */

interface LeaderboardProps {
  gameName?: string;
  limit?: number;
}

export const Leaderboard = ({
  gameName = "dino-jump",
  limit = 10,
}: LeaderboardProps) => {
  const topScores = useQuery(api.lib.system.games.queries.getTopScores, {
    gameName,
    limit,
  });

  const stats = useQuery(api.lib.system.games.queries.getGameStats, {
    gameName,
  });

  if (!topScores) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
        </h2>
        <div className="text-center text-gray-500 py-4">Loading...</div>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Leaderboard
      </h2>

      {/* Game Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div className="text-center p-2 bg-gray-100 rounded">
            <div className="font-bold text-lg">{stats.totalGames}</div>
            <div className="text-gray-600 text-xs">Games Played</div>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded">
            <div className="font-bold text-lg">{stats.totalPlayers}</div>
            <div className="text-gray-600 text-xs">Players</div>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded">
            <div className="font-bold text-lg">{stats.highestScore}</div>
            <div className="text-gray-600 text-xs">Top Score</div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {topScores.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No scores yet!</p>
          <p className="text-sm mt-2">Be the first to set a high score.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topScores.map((scoreEntry, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;

            return (
              <div
                key={scoreEntry._id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isTopThree
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(rank)}
                </div>

                {/* Rank Number */}
                <div
                  className={`text-lg font-bold w-8 ${
                    isTopThree ? "text-yellow-700" : "text-gray-600"
                  }`}
                >
                  #{rank}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {scoreEntry.userName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {scoreEntry.obstaclesJumped} obstacles cleared
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div
                    className={`text-xl font-bold ${
                      isTopThree ? "text-yellow-700" : "text-gray-700"
                    }`}
                  >
                    {scoreEntry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.floor(scoreEntry.timePlayedMs / 1000)}s
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
        Top {limit} players shown
      </div>
    </Card>
  );
};
