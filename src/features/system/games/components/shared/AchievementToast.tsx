/**
 * Achievement Toast Component
 *
 * Animated notification for unlocked achievements
 */

import React, { useEffect, useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Achievement } from '../../engine';

interface AchievementToastProps {
  /** Achievement data */
  achievement: Achievement;
  /** Duration to show (ms) */
  duration?: number;
  /** Callback when dismissed */
  onDismiss?: () => void;
}

export function AchievementToast({
  achievement,
  duration = 5000,
  onDismiss,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg shadow-xl p-4 pr-12 max-w-sm relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-white/10 animate-pulse" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {achievement.icon ? (
                <span className="text-3xl">{achievement.icon}</span>
              ) : (
                <Trophy className="h-8 w-8" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Achievement Unlocked
                </span>
              </div>

              <h4 className="font-bold text-lg mb-1">{achievement.name}</h4>

              <p className="text-sm text-white/90 mb-2">{achievement.description}</p>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded">
                  +{achievement.points} points
                </span>
                {achievement.category && (
                  <span className="bg-white/20 px-2 py-1 rounded">
                    {achievement.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-white hover:bg-white/20"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all"
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Achievement Toast Manager
 *
 * Manages multiple achievement notifications
 */
export function useAchievementToast() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const showAchievement = (achievement: Achievement) => {
    setAchievements((prev) => [...prev, achievement]);
  };

  const dismissAchievement = (index: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  const ToastContainer = () => (
    <>
      {achievements.map((achievement, index) => (
        <AchievementToast
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onDismiss={() => dismissAchievement(index)}
        />
      ))}
    </>
  );

  return { showAchievement, ToastContainer };
}
