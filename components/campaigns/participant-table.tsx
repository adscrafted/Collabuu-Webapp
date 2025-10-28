'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { User, UserMinus, Trophy, TrendingUp, Users, Instagram, Youtube, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';
import { CampaignParticipant } from '@/lib/types/campaign';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatNumberWithCommas, getPerformanceTier } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ParticipantTableProps {
  participants: CampaignParticipant[];
  onRemove: (participantId: string) => void;
  isLoading?: boolean;
}

export function ParticipantTable({ participants, onRemove, isLoading }: ParticipantTableProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<CampaignParticipant | null>(null);

  const handleRemoveClick = (participant: CampaignParticipant) => {
    setSelectedParticipant(participant);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (selectedParticipant) {
      onRemove(selectedParticipant.id);
      setRemoveDialogOpen(false);
      setSelectedParticipant(null);
    }
  };

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      instagram: Instagram,
      youtube: Youtube,
      facebook: Facebook,
      twitter: Twitter,
      linkedin: Linkedin,
      tiktok: MessageSquare,
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

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Influencer</TableHead>
              <TableHead className="font-semibold text-gray-900">Visits</TableHead>
              <TableHead className="font-semibold text-gray-900">Credits Earned</TableHead>
              <TableHead className="font-semibold text-gray-900">Joined</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => {
              const displayCount = participant.customerCount ?? participant.visitCount ?? participant.visitsGenerated;
              const displayLabel = participant.customerCount ? 'customers' : 'visits';
              const performanceTier = getPerformanceTier(displayCount);

              const availablePlatforms = participant.socialMediaHandles
                ? Object.entries(participant.socialMediaHandles)
                    .filter(([_, handle]) => handle)
                    .map(([platform]) => platform)
                : [];

              return (
                <TableRow key={participant.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.influencerAvatar} alt={participant.influencerName} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {participant.influencerName}
                          </span>
                          {performanceTier === 'excellent' && (
                            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 h-5 px-1.5">
                              <Trophy className="mr-1 h-3 w-3" />
                              Top
                            </Badge>
                          )}
                          {performanceTier === 'good' && (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 h-5 px-1.5">
                              <TrendingUp className="mr-1 h-3 w-3" />
                              High
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {participant.influencerUsername && (
                            <span className="text-sm text-gray-500">@{participant.influencerUsername}</span>
                          )}
                          {availablePlatforms.length > 0 && (
                            <>
                              {participant.influencerUsername && (
                                <span className="text-gray-300">•</span>
                              )}
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
                                      className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors ${iconColors}`}
                                      title={`${platform}: ${handle || ''}`}
                                      onClick={(e) => {
                                        if (!handle) e.preventDefault();
                                      }}
                                    >
                                      <Icon className="h-2.5 w-2.5" />
                                    </a>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className={`h-4 w-4 ${
                        performanceTier === 'excellent' ? 'text-yellow-600' :
                        performanceTier === 'good' ? 'text-green-600' :
                        'text-blue-600'
                      }`} />
                      <span className={`font-semibold ${
                        performanceTier === 'excellent' ? 'text-yellow-700' :
                        performanceTier === 'good' ? 'text-green-700' :
                        'text-blue-700'
                      }`}>
                        {formatNumber(displayCount)}
                      </span>
                      <span className="text-sm text-gray-500">{displayLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-900">
                      {formatNumberWithCommas(participant.creditsEarned)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {format(new Date(participant.joinedAt), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveClick(participant)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedParticipant?.influencerName} from this campaign?
              They will no longer be able to generate visits and their existing stats will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Participant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
