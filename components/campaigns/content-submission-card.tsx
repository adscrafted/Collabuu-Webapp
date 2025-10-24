'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Video, Image as ImageIcon, ExternalLink, Instagram, Youtube, X, CheckCircle } from 'lucide-react';
import { ContentSubmission } from '@/lib/types/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApproveContent } from '@/lib/hooks/use-campaign-detail';
import { useToast } from '@/components/ui/use-toast';

interface ContentSubmissionCardProps {
  submission: ContentSubmission;
  campaignId: string;
  onView: (id: string) => void;
  isLoading?: boolean;
}

export function ContentSubmissionCard({
  submission,
  campaignId,
  onView,
  isLoading,
}: ContentSubmissionCardProps) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const approveContent = useApproveContent(campaignId);

  const handleCardClick = () => {
    if (submission.status === 'new') {
      onView(submission.id);
    }
    setShowModal(true);
  };

  const handleApprove = () => {
    approveContent.mutate(submission.id, {
      onSuccess: () => {
        toast({
          title: 'Content Approved',
          description: 'Content submission has been approved',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to approve content',
          variant: 'destructive',
        });
      },
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'tiktok':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
          </svg>
        );
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const renderEmbed = () => {
    const { platform, contentUrl, imageUrl: thumbnailUrl } = submission;

    // Instagram embed
    if (platform === 'instagram' && contentUrl.includes('instagram.com')) {
      return (
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          <iframe
            src={`${contentUrl}embed`}
            className="h-full w-full border-0"
            allowFullScreen
            scrolling="no"
          />
        </div>
      );
    }

    // YouTube embed
    if (platform === 'youtube' && contentUrl.includes('youtube.com')) {
      const videoId = contentUrl.split('v=')[1]?.split('&')[0] || contentUrl.split('/').pop();
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="h-full w-full border-0"
            allowFullScreen
          />
        </div>
      );
    }

    // TikTok embed
    if (platform === 'tiktok' && contentUrl.includes('tiktok.com')) {
      return (
        <div className="aspect-[9/16] mx-auto max-w-md overflow-hidden rounded-lg">
          <iframe
            src={`${contentUrl}embed`}
            className="h-full w-full border-0"
            allowFullScreen
            scrolling="no"
          />
        </div>
      );
    }

    // Fallback: Show thumbnail or placeholder
    if (thumbnailUrl) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={thumbnailUrl}
            alt="Content preview"
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100">
        {getContentTypeIcon(submission.postType)}
        <p className="ml-2 text-sm text-gray-500">No preview available</p>
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card
        className="group cursor-pointer overflow-hidden shadow-sm transition-all hover:shadow-lg border-gray-200"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
            {submission.imageUrl ? (
              <img
                src={submission.imageUrl}
                alt={submission.caption || 'Content'}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {getContentTypeIcon(submission.postType)}
              </div>
            )}

            {/* Status Badge */}
            {submission.status === 'new' && (
              <Badge className="absolute right-3 top-3 bg-red-600 hover:bg-red-700">
                New
              </Badge>
            )}
            {submission.status === 'approved' && (
              <Badge className="absolute right-3 top-3 bg-green-500 hover:bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            )}

            {/* Platform Badge */}
            <div className="absolute bottom-3 right-3">
              <div className="rounded-full bg-black/60 p-2 text-white backdrop-blur-sm">
                {getPlatformIcon(submission.platform)}
              </div>
            </div>
          </div>

          {/* Content Info */}
          <div className="space-y-3 p-4">
            {/* Influencer Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-gray-200">
                <AvatarImage src={submission.influencerAvatar} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                  {getInitials(submission.influencerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {submission.influencerName}
                </p>
                {submission.influencerUsername && (
                  <p className="text-sm text-gray-600 truncate">
                    @{submission.influencerUsername}
                  </p>
                )}
              </div>
            </div>

            {/* Caption */}
            {submission.caption && (
              <p className="text-sm text-gray-700 line-clamp-2">
                {submission.caption}
              </p>
            )}

            {/* Date */}
            <p className="text-xs text-gray-500">
              {format(new Date(submission.postedAt), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Full Content Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-gray-200">
                <AvatarImage src={submission.influencerAvatar} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                  {getInitials(submission.influencerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">
                  {submission.influencerName}
                </p>
                {submission.influencerUsername && (
                  <p className="text-sm font-normal text-gray-600">
                    @{submission.influencerUsername}
                  </p>
                )}
              </div>
              {submission.status === 'new' && (
                <Badge className="bg-red-600">New</Badge>
              )}
              {submission.status === 'viewed' && (
                <Badge variant="secondary">Viewed</Badge>
              )}
              {submission.status === 'approved' && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Embedded Content */}
            <div className="w-full">{renderEmbed()}</div>

            {/* Caption */}
            {submission.caption && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Caption</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {submission.caption}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Platform</p>
                <div className="mt-1 flex items-center gap-2">
                  {getPlatformIcon(submission.platform)}
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {submission.platform}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Content Type</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">
                  {submission.postType}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Submitted</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {format(new Date(submission.postedAt), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
              {submission.viewedAt && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Viewed</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {format(new Date(submission.viewedAt), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(submission.contentUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Original
              </Button>
              {submission.status === 'viewed' && (
                <Button
                  variant="default"
                  onClick={handleApprove}
                  disabled={approveContent.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowModal(false)}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
