// src/routes/{-$locale}/_protected/_boilerplate/games/$gameId.tsx

import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui";
import { Button } from "@/components/ui";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { getGame } from "@/features/boilerplate/games/config/registry";
import { DinoGameContainer } from "@/features/boilerplate/games/dino/components/DinoGameContainer";
import { TetrisGameContainer } from "@/features/boilerplate/games/tetris/components/TetrisGameContainer";
import { useAuth } from "@/features/boilerplate/auth/hooks/useAuth";

/**
 * Game Page
 * Individual game page using unified game registry
 */

export const Route = createFileRoute(
  "/{-$locale}/_protected/_boilerplate/games/$gameId"
)({
  component: GamePage,
});

function GamePage() {
  const { gameId } = Route.useParams();
  const { user } = useAuth();

  const currentGame = getGame(gameId);

  if (!currentGame) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-6">
            The game you're looking for doesn't exist.
          </p>
          <Link to="/{-$locale}/games">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Render the appropriate game component
  const renderGame = () => {
    if (!user) {
      return <div>Please log in to play</div>;
    }

    switch (gameId) {
      case 'dino':
        return <DinoGameContainer userId={user.id} userName={user.name} />;
      case 'tetris':
        return <TetrisGameContainer userId={user.id} userName={user.name} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link to="/{-$locale}/games">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{currentGame.icon}</span>
          <h1 className="text-3xl font-bold">{currentGame.name}</h1>
        </div>
        <p className="text-gray-600">{currentGame.description}</p>

        {/* Game Features */}
        <div className="flex flex-wrap gap-2 mt-3">
          {currentGame.features.achievements && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              ✨ {currentGame.tags.includes('achievements') ? 'Achievements' : 'Achievements Available'}
            </span>
          )}
          {currentGame.features.leaderboard && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              🏆 Leaderboards
            </span>
          )}
          {currentGame.features.replays && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              🎬 Replays
            </span>
          )}
          {currentGame.features.multiplayer && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              👥 Multiplayer
            </span>
          )}
        </div>
      </div>

      {/* Game Container */}
      <div className="mb-6">
        {renderGame()}
      </div>

      {/* Tips Section */}
      <Card className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Tips for {currentGame.name}
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {gameId === 'dino' && (
            <>
              <li>• Press Space or ↑ to jump over obstacles</li>
              <li>• Press ↓ to duck under flying birds</li>
              <li>• The game gets faster as your score increases</li>
              <li>• Time your jumps carefully for perfect scores</li>
              <li>• Practice makes perfect!</li>
            </>
          )}
          {gameId === 'tetris' && (
            <>
              <li>• Use ← → to move pieces left/right</li>
              <li>• Press ↑ or X to rotate clockwise, Z for counter-clockwise</li>
              <li>• Press Space for hard drop</li>
              <li>• Press C or Shift to hold a piece for later</li>
              <li>• Clear 4 lines at once for a Tetris!</li>
              <li>• Build combos by clearing lines consecutively</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
}
