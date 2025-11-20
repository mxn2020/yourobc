/**
 * Leaderboard Table Component
 *
 * Generic leaderboard display for any game
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry } from '../../engine';

interface LeaderboardTableProps {
  /** Leaderboard entries */
  entries: LeaderboardEntry[];
  /** Show user's rank even if not in top entries */
  currentUserRank?: LeaderboardEntry;
  /** Table title */
  title?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Show additional columns */
  showTimeColumn?: boolean;
  showDateColumn?: boolean;
}

export function LeaderboardTable({
  entries,
  currentUserRank,
  title = 'Leaderboard',
  isLoading,
  emptyMessage = 'No scores yet. Be the first!',
  showTimeColumn = true,
  showDateColumn = false,
}: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 2:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
      case 3:
        return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
                {showTimeColumn && <TableHead className="text-right">Time</TableHead>}
                {showDateColumn && <TableHead className="text-right">Date</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={`${entry.userId}-${entry.createdAt}`}
                  className={entry.isCurrentUser ? 'bg-primary/5' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-semibold ${getRankBadgeClass(
                          entry.rank
                        )}`}
                      >
                        {entry.rank}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.displayName}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {entry.score.toLocaleString()}
                  </TableCell>
                  {showTimeColumn && (
                    <TableCell className="text-right text-muted-foreground">
                      {formatTime(entry.timePlayedMs)}
                    </TableCell>
                  )}
                  {showDateColumn && (
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {/* Show current user rank if not in top entries */}
              {currentUserRank && !entries.find(e => e.isCurrentUser) && (
                <>
                  <TableRow>
                    <TableCell colSpan={showTimeColumn && showDateColumn ? 5 : showTimeColumn || showDateColumn ? 4 : 3} className="text-center py-2">
                      <span className="text-muted-foreground text-sm">...</span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border font-semibold bg-muted text-muted-foreground">
                        {currentUserRank.rank}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {currentUserRank.displayName}
                      <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {currentUserRank.score.toLocaleString()}
                    </TableCell>
                    {showTimeColumn && (
                      <TableCell className="text-right text-muted-foreground">
                        {formatTime(currentUserRank.timePlayedMs)}
                      </TableCell>
                    )}
                    {showDateColumn && (
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDate(currentUserRank.createdAt)}
                      </TableCell>
                    )}
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
