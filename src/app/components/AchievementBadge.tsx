import { Badge as BadgeType } from '../utils/badges';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Badge } from './ui/badge';
import { Calendar, Trophy, Lock } from 'lucide-react';

interface AchievementBadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ badge, size = 'md' }: AchievementBadgeProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const badgeContent = (
    <div
      className={`${sizeClasses[size]} ${badge.color} rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
        badge.isUnlocked
          ? 'hover:scale-110 hover:shadow-lg'
          : 'opacity-40 grayscale hover:opacity-60'
      } relative`}
    >
      <span className="select-none">{badge.icon}</span>
      {!badge.isUnlocked && badge.progress !== undefined && badge.progress > 0 && (
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-300"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - badge.progress / 100)}`}
            className="text-blue-500 transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
      )}
      {!badge.isUnlocked && (!badge.progress || badge.progress === 0) && (
        <div className="absolute inset-0 rounded-full bg-gray-900/20 flex items-center justify-center">
          <Lock className="w-6 h-6 text-gray-600" />
        </div>
      )}
    </div>
  );

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{badgeContent}</HoverCardTrigger>
      <HoverCardContent className="w-72" side="top">
        <div className="space-y-3">
          {/* Badge Title with Icon */}
          <div className="flex items-start gap-3">
            <div className={`${badge.color} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${!badge.isUnlocked && 'opacity-40 grayscale'}`}>
              <span className="text-2xl">{badge.icon}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm leading-tight">
                {badge.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {badge.description}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {badge.isUnlocked ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Unlocked
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>

          {/* Progress Bar (for badges in progress) */}
          {!badge.isUnlocked && badge.progress !== undefined && badge.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{Math.round(badge.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Requirement */}
          {!badge.isUnlocked && badge.requirement && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Requirement:</span> {badge.requirement}
              </p>
            </div>
          )}

          {/* Date Obtained */}
          {badge.isUnlocked && badge.dateObtained && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">
                Obtained on {formatDate(badge.dateObtained)}
              </span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}