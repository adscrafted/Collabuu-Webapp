'use client';

import { useState } from 'react';
import { CheckCircle, Users, UserCheck, AlertCircle, Search, X, UserPlus } from 'lucide-react';
import {
  useCampaignApplications,
  useCampaignParticipants,
  useAcceptApplication,
  useRejectApplication,
  useRemoveParticipant,
} from '@/lib/hooks/use-campaign-detail';
import { Campaign, CampaignType } from '@/lib/types/campaign';
import { isMediaEventPassed } from '@/lib/utils/campaign-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { InfluencerApplicationCard } from '@/components/campaigns/influencer-application-card';
import { ParticipantCard } from '@/components/campaigns/participant-card';
import { InviteInfluencersDialog } from '@/components/campaigns/invite-influencers-dialog';

interface InfluencersTabProps {
  campaignId: string;
  campaign: Campaign;
}

export function InfluencersTab({ campaignId, campaign }: InfluencersTabProps) {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<'recent' | 'performance'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Queries
  const { data: applications, isLoading: applicationsLoading } =
    useCampaignApplications(campaignId);
  const { data: participants, isLoading: participantsLoading } =
    useCampaignParticipants(campaignId);

  // Mutations
  const acceptApplication = useAcceptApplication(campaignId);
  const rejectApplication = useRejectApplication(campaignId);
  const removeParticipant = useRemoveParticipant(campaignId);

  // Filter out withdrawn applications (iOS behavior - withdrawn apps are hidden)
  const activeApplications = applications?.filter((app) => app.status !== 'withdrawn') || [];
  const pendingApplications = activeApplications.filter((app) => app.status === 'pending');
  // const acceptedApplications = activeApplications.filter((app) => app.status === 'accepted') || [];

  // Filter applications by search query
  const filteredApplications = pendingApplications.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = app.influencerName?.toLowerCase().includes(query);
    return nameMatch;
  }).sort((a, b) => {
    // Sort like iOS: applications before invitations, then by date
    if (a.applicationType !== b.applicationType) {
      if (a.applicationType === 'application') return -1;
      if (b.applicationType === 'application') return 1;
    }
    // Within same type, sort by date (newest first)
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });

  const handleAccept = async (applicationId: string) => {
    try {
      await acceptApplication.mutateAsync({ applicationId });
      toast({
        title: 'Application Accepted',
        description: 'The influencer has been added to your campaign',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept application',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await rejectApplication.mutateAsync({ applicationId });
      toast({
        title: 'Application Rejected',
        description: 'Application has been rejected',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject application',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (participantId: string) => {
    try {
      await removeParticipant.mutateAsync({ participantId });
      toast({
        title: 'Participant Removed',
        description: 'The influencer has been removed from the campaign',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove participant',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptAll = async () => {
    try {
      await Promise.all(
        pendingApplications.map((app) =>
          acceptApplication.mutateAsync({ applicationId: app.id })
        )
      );
      toast({
        title: 'Success',
        description: `Accepted ${pendingApplications.length} applications`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept all applications',
        variant: 'destructive',
      });
    }
  };


  // Filter participants by search query
  const filteredParticipants = participants
    ? participants.filter(p => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const nameMatch = p.influencerName?.toLowerCase().includes(query);
        return nameMatch;
      })
    : [];

  const sortedParticipants = filteredParticipants
    ? [...filteredParticipants].sort((a, b) => {
        switch (sortBy) {
          case 'performance':
            // Sort by customerCount first, fallback to visitCount, then visitsGenerated
            const aCount = a.customerCount ?? a.visitCount ?? a.visitsGenerated;
            const bCount = b.customerCount ?? b.visitCount ?? b.visitsGenerated;
            return bCount - aCount;
          case 'recent':
          default:
            return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        }
      })
    : [];

  // Check if media event has passed
  const eventHasPassed = isMediaEventPassed(campaign);
  const isMediaEvent = campaign.type === CampaignType.MEDIA_EVENT;

  // Check if invites are allowed (matching iOS logic)
  const canInviteInfluencers = !eventHasPassed && (campaign.status === 'active' || campaign.status === 'draft');

  const handleInviteInfluencers = () => {
    setShowInviteDialog(true);
  };

  return (
    <div className="space-y-8">
      {/* Media Event Warning */}
      {isMediaEvent && eventHasPassed && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Event Has Ended</AlertTitle>
          <AlertDescription>
            This media event has already taken place. Invitations are now closed and new applications cannot be accepted.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-gray-100 p-1 shadow-sm">
            <TabsTrigger value="pending" className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Pending Applications
              {pendingApplications.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  {pendingApplications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Accepted Influencers
              {participants && participants.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {participants.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="space-y-6 mt-0">
          {/* Pending Applications Header */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-xl">Pending Applications</CardTitle>
                  <CardDescription className="mt-1">
                    Review and accept influencer applications for your campaign
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleInviteInfluencers}
                    disabled={!canInviteInfluencers}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                  {pendingApplications.length > 0 && (
                    <Button
                      onClick={handleAcceptAll}
                      disabled={acceptApplication.isPending || !canInviteInfluencers}
                      className="shadow-sm hover:shadow transition-shadow bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve All ({pendingApplications.length})
                    </Button>
                  )}
                </div>
              </div>
              {pendingApplications.length > 3 && (
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search influencers by name or username"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9 shadow-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="text-sm text-gray-600 mt-2">
                      Showing {filteredApplications.length} of {pendingApplications.length} influencers
                    </p>
                  )}
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Applications List */}
          {applicationsLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredApplications.map((application) => (
                <InfluencerApplicationCard
                  key={application.id}
                  application={application}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isLoading={acceptApplication.isPending || rejectApplication.isPending}
                  disabled={eventHasPassed}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <Card className="shadow-sm border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No Results Found
                </h3>
                <p className="text-center text-sm text-gray-600 max-w-md">
                  No influencers match your search. Try a different name or username.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-green-100 p-4 mb-4">
                  <UserCheck className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No Pending Applications
                </h3>
                <p className="text-center text-sm text-gray-600 max-w-md">
                  All applications have been reviewed. New applications will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-6 mt-0">
          {/* Participants Header */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div>
                <CardTitle className="text-xl">Active Influencers</CardTitle>
                <CardDescription className="mt-1">
                  Influencers currently promoting your campaign
                </CardDescription>
              </div>
              {participants && participants.length > 3 && (
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search influencers by name or username"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9 shadow-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="text-sm text-gray-600 mt-2">
                      Showing {filteredParticipants.length} of {participants.length} influencers
                    </p>
                  )}
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Participants List */}
          {participantsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          ) : sortedParticipants.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedParticipants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  onRemove={handleRemove}
                  isLoading={removeParticipant.isPending}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <Card className="shadow-sm border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No Results Found
                </h3>
                <p className="text-center text-sm text-gray-600 max-w-md">
                  No influencers match your search. Try a different name or username.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-blue-100 p-4 mb-4">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No Influencers Yet</h3>
                <p className="text-center text-sm text-gray-600 max-w-md">
                  Accept applications to add influencers to your campaign
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Influencers Dialog */}
      <InviteInfluencersDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        campaignId={campaignId}
      />
    </div>
  );
}
