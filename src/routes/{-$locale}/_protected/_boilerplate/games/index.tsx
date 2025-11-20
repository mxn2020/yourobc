// src/routes/{-$locale}/_protected/_boilerplate/games/index.tsx

import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui";
import { Button } from "@/components/ui";
import { Link } from "@tanstack/react-router";
import { Gamepad2, Trophy, TrendingUp, Users, Star } from "lucide-react";
import { getActiveGames } from "@/features/boilerplate/games/config/registry";

/**
 * Games Lobby Page
 * Lists available games using the unified game registry
 */

export const Route = createFileRoute(
  "/{-$locale}/_protected/_boilerplate/games/"
)({
  component: GamesLobbyPage,
});

function GamesLobbyPage() {
  const games = getActiveGames();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Gamepad2 className="w-10 h-10 text-blue-600" />
          Game Arcade
        </h1>
        <p className="text-gray-600">
          Play games, compete with others, and climb the leaderboard!
        </p>
      </div>

      {/* Featured Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{games.length}</div>
              <div className="text-sm text-gray-600">Games Available</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-700">Top Score</div>
              <div className="text-sm text-gray-600">Compete for #1</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700">Real-time</div>
              <div className="text-sm text-gray-600">Live Leaderboards</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          return (
            <Card
              key={game.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Game Header */}
              <div
                className="h-32 flex items-center justify-center text-6xl"
                style={{
                  background: `linear-gradient(to right, ${game.theme?.primary || '#0066ff'}, ${game.theme?.secondary || '#000000'})`,
                }}
              >
                <span className="filter drop-shadow-lg">{game.icon}</span>
              </div>

              {/* Game Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {game.description}
                </p>

                {/* Game Meta */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                    {game.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {game.category}
                  </span>
                  {game.features.multiplayer && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Multiplayer
                    </span>
                  )}
                  {game.features.achievements && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Achievements
                    </span>
                  )}
                </div>

                {/* Play Button */}
                <Link
                  to="/{-$locale}/games/$gameId"
                  params={{ gameId: game.id }}
                >
                  <Button className="w-full gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Play Now
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-lg font-semibold mb-2">🎮 Game Features</h3>
        <ul className="text-gray-600 text-sm space-y-1">
          <li>✨ Achievements to unlock</li>
          <li>🏆 Global leaderboards</li>
          <li>🎬 Replay your best games</li>
          <li>📊 Track your statistics</li>
          <li>👥 Multiplayer support (Tetris)</li>
        </ul>
      </Card>
    </div>
  );
}
