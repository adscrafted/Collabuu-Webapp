'use client';

import { useState, useEffect } from 'react';
import { Search, X, UserPlus, Check, Loader2, Instagram, Youtube, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Influencer {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  socialMediaHandles?: Record<string, string>;
  applicationStatus?: string;
  applicationType?: string;
}

interface InviteInfluencersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
}

export function InviteInfluencersDialog({
  open,
  onOpenChange,
  campaignId,
}: InviteInfluencersDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<string>>(new Set());

  // Reset selection when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedInfluencers(new Set());
      setSearchQuery('');
    }
  }, [open]);

  // Fetch influencers
  const { data: influencers, isLoading } = useQuery({
    queryKey: ['influencers', campaignId, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        campaignId,
        ...(searchQuery && { search: searchQuery }),
      });
      const response = await apiClient.get<Influencer[]>(
        `/api/business/influencers?${params.toString()}`
      );
      return response.data;
    },
    enabled: open,
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: async (influencerIds: string[]) => {
      const response = await apiClient.post(
        `/api/business/campaigns/${campaignId}/invite`,
        { influencerIds }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'applications', campaignId] });
      toast({
        title: 'Invitations Sent',
        description: `Successfully invited ${data.successful} influencer${data.successful !== 1 ? 's' : ''}`,
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send invitations',
        variant: 'destructive',
      });
    },
  });

  const handleInvite = (influencerId: string) => {
    inviteMutation.mutate([influencerId]);
  };

  const handleBulkInvite = () => {
    if (selectedInfluencers.size === 0) return;
    inviteMutation.mutate(Array.from(selectedInfluencers));
  };

  const toggleSelection = (influencerId: string) => {
    const newSelection = new Set(selectedInfluencers);
    if (newSelection.has(influencerId)) {
      newSelection.delete(influencerId);
    } else {
      newSelection.add(influencerId);
    }
    setSelectedInfluencers(newSelection);
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
      instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white',
      youtube: 'bg-red-500 text-white',
      facebook: 'bg-blue-600 text-white',
      twitter: 'bg-black text-white',
      linkedin: 'bg-blue-700 text-white',
      tiktok: 'bg-black text-white',
    };
    return colors[platform.toLowerCase()] || 'bg-gray-500 text-white';
  };

  const getStatusBadge = (influencer: Influencer) => {
    if (!influencer.applicationStatus) return null;

    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: {
        label: influencer.applicationType === 'invitation' ? 'Invited' : 'Applied',
        className: 'bg-yellow-500 text-white',
      },
      accepted: { label: 'Accepted', className: 'bg-green-600 text-white' },
      rejected: { label: 'Rejected', className: 'bg-red-600 text-white' },
      withdrawn: { label: 'Withdrawn', className: 'bg-gray-500 text-white' },
    };

    const config = statusConfig[influencer.applicationStatus];
    if (!config) return null;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Filter out influencers who already have non-withdrawn applications
  const availableInfluencers = influencers?.filter(
    (inf) => !inf.applicationStatus || inf.applicationStatus === 'withdrawn'
  ) || [];

  const unavailableInfluencers = influencers?.filter(
    (inf) => inf.applicationStatus && inf.applicationStatus !== 'withdrawn'
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Invite Influencers</DialogTitle>
          <DialogDescription>
            Search and select influencers to invite to your campaign
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Bulk Selection Bar */}
        {selectedInfluencers.size > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-pink-50 px-4 py-3 border border-pink-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-pink-900">
                {selectedInfluencers.size} influencer{selectedInfluencers.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInfluencers(new Set())}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleBulkInvite}
                disabled={inviteMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite All
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Influencers List */}
        <ScrollArea className="flex-1 min-h-0 -mx-6 px-6 max-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : availableInfluencers.length === 0 && unavailableInfluencers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">
                {searchQuery ? 'No influencers match your search' : 'No influencers available'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Available Influencers */}
              {availableInfluencers.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Available to Invite</h3>
                  <div className="space-y-2">
                    {availableInfluencers.map((influencer) => (
                      <div
                        key={influencer.id}
                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedInfluencers.has(influencer.id)}
                          onCheckedChange={() => toggleSelection(influencer.id)}
                        />

                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={influencer.avatar} alt={influencer.name} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {getInitials(influencer.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {influencer.name}
                            </h4>
                            {getStatusBadge(influencer)}
                          </div>
                          {influencer.username && (
                            <p className="text-sm text-gray-500">@{influencer.username}</p>
                          )}
                          {influencer.bio && (
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                              {influencer.bio}
                            </p>
                          )}
                          {influencer.socialMediaHandles && (
                            <div className="flex gap-1 mt-2">
                              {Object.entries(influencer.socialMediaHandles)
                                .filter(([_, handle]) => handle)
                                .map(([platform]) => {
                                  const Icon = getSocialIcon(platform);
                                  const colors = getSocialIconColors(platform);
                                  return (
                                    <div
                                      key={platform}
                                      className={`flex items-center justify-center w-5 h-5 rounded-full ${colors}`}
                                    >
                                      <Icon className="h-3 w-3" />
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleInvite(influencer.id)}
                          disabled={inviteMutation.isPending}
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Already Applied/Invited */}
              {unavailableInfluencers.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Already Applied/Invited</h3>
                  <div className="space-y-2 opacity-60">
                    {unavailableInfluencers.map((influencer) => (
                      <div
                        key={influencer.id}
                        className="flex items-center gap-4 rounded-lg border p-4 bg-gray-50"
                      >
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={influencer.avatar} alt={influencer.name} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {getInitials(influencer.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {influencer.name}
                            </h4>
                            {getStatusBadge(influencer)}
                          </div>
                          {influencer.username && (
                            <p className="text-sm text-gray-500">@{influencer.username}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
