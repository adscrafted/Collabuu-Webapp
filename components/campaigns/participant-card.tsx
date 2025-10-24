'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { User, TrendingUp, UserMinus, Trophy, Activity, Users } from 'lucide-react';
import { CampaignParticipant } from '@/lib/types/campaign';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatNumber, getPerformanceTier } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ParticipantCardProps {
  participant: CampaignParticipant;
  onRemove: (participantId: string) => void;
  isLoading?: boolean;
}

export function ParticipantCard({ participant, onRemove, isLoading }: ParticipantCardProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleRemove = () => {
    onRemove(participant.id);
    setShowRemoveDialog(false);
  };

  // Use customerCount if available, fallback to visitCount, then visitsGenerated
  const displayCount = participant.customerCount ?? participant.visitCount ?? participant.visitsGenerated;
  const displayLabel = participant.customerCount ? 'customers' : 'visits';
  const performanceTier = getPerformanceTier(displayCount);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={participant.influencerAvatar} alt={participant.influencerName} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {participant.influencerName}
                </h3>
                {performanceTier === 'excellent' && (
                  <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                    <Trophy className="mr-1 h-3 w-3" />
                    Top Performer
                  </Badge>
                )}
                {performanceTier === 'good' && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    High Performer
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-gray-500">
                  {formatNumber(participant.followerCount)} followers
                </p>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <Users className={`h-4 w-4 ${
                    performanceTier === 'excellent' ? 'text-yellow-600' :
                    performanceTier === 'good' ? 'text-green-600' :
                    'text-blue-600'
                  }`} />
                  <p className={`text-sm font-semibold ${
                    performanceTier === 'excellent' ? 'text-yellow-700' :
                    performanceTier === 'good' ? 'text-green-700' :
                    'text-blue-700'
                  }`}>
                    {formatNumber(displayCount)} {displayLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Visits</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {participant.visitsGenerated}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Conversions</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {participant.conversions}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Credits Earned</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {participant.creditsEarned}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Conversion Rate</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {(participant.conversionRate ?? 0).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span>Joined {format(new Date(participant.joinedAt), 'MMM d, yyyy')}</span>
              </div>
              {participant.lastActivityAt && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    Last active {format(new Date(participant.lastActivityAt), 'MMM d')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end border-t bg-gray-50 px-6 py-4">
        <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              disabled={isLoading}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Participant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {participant.influencerName} from this campaign?
                They will no longer be able to generate visits and their existing stats will be
                preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Participant
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
