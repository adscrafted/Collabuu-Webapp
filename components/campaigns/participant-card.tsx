'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { User, TrendingUp, UserMinus, Trophy, Activity, Users, Instagram, Youtube, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';
import { CampaignParticipant } from '@/lib/types/campaign';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatNumberWithCommas, getPerformanceTier } from '@/lib/utils';
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

  // Use visitCount or visitsGenerated (treating all as visits)
  const displayCount = participant.visitCount ?? participant.visitsGenerated;
  const performanceTier = getPerformanceTier(displayCount);

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      instagram: Instagram,
      youtube: Youtube,
      facebook: Facebook,
      twitter: Twitter,
      linkedin: Linkedin,
      tiktok: MessageSquare, // Using MessageSquare as placeholder for TikTok
    };
    return icons[platform.toLowerCase()] || MessageSquare;
  };

  const getSocialIconColors = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600',
      youtube: 'bg-red-500 text-white hover:bg-red-600',
      facebook: 'bg-blue-600 text-white hover:bg-blue-700',
      twitter: 'bg-black text-white hover:bg-gray-800',
      linkedin: 'bg-blue-700 text-white hover:bg-blue-800',
      tiktok: 'bg-black text-white hover:bg-gray-800',
    };
    return colors[platform.toLowerCase()] || 'bg-gray-500 text-white hover:bg-gray-600';
  };

  const getSocialMediaLink = (platform: string, handle: string) => {
    const cleanHandle = handle.replace('@', '');
    const links: Record<string, string> = {
      instagram: `https://instagram.com/${cleanHandle}`,
      tiktok: `https://tiktok.com/@${cleanHandle}`,
      youtube: `https://youtube.com/@${cleanHandle}`,
      facebook: `https://facebook.com/${cleanHandle}`,
      twitter: `https://twitter.com/${cleanHandle}`,
      linkedin: `https://linkedin.com/company/${cleanHandle}`,
    };
    return links[platform.toLowerCase()] || '#';
  };

  const availablePlatforms = participant.socialMediaHandles
    ? Object.entries(participant.socialMediaHandles)
        .filter(([_, handle]) => handle)
        .map(([platform]) => platform)
    : [];

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
              <div className="flex items-center gap-2 flex-wrap">
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
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {participant.influencerUsername && (
                  <>
                    <p className="text-sm text-gray-500">
                      @{participant.influencerUsername}
                    </p>
                    <span className="text-gray-300">•</span>
                  </>
                )}
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
                    {formatNumber(displayCount)} visits
                  </p>
                </div>
                {availablePlatforms.length > 0 && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex gap-1">
                      {availablePlatforms.map((platform) => {
                        const Icon = getSocialIcon(platform);
                        const iconColors = getSocialIconColors(platform);
                        const handle = participant.socialMediaHandles?.[platform as keyof typeof participant.socialMediaHandles];
                        const link = handle ? getSocialMediaLink(platform, handle) : '#';
                        return (
                          <a
                            key={platform}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${iconColors}`}
                            title={`${platform}: ${handle || ''}`}
                            onClick={(e) => {
                              if (!handle) e.preventDefault();
                            }}
                          >
                            <Icon className="h-3 w-3" />
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Visits</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatNumberWithCommas(participant.visitsGenerated)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Credits Earned</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatNumberWithCommas(participant.creditsEarned)}
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
