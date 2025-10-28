'use client';

import { format } from 'date-fns';
import { Check, X, Instagram, Youtube, Facebook, Twitter, Linkedin, MessageSquare } from 'lucide-react';
import { InfluencerApplication } from '@/lib/types/campaign';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface InfluencerApplicationCardProps {
  application: InfluencerApplication;
  onAccept: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function InfluencerApplicationCard({
  application,
  onAccept,
  onReject,
  isLoading,
  disabled = false,
}: InfluencerApplicationCardProps) {
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

  const getPrimaryHandle = () => {
    const handles = application.socialMediaHandles;
    if (!handles) return null;

    // Priority order: Instagram > TikTok > YouTube > Facebook > Twitter > LinkedIn
    const priority = ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'linkedin'];

    for (const platform of priority) {
      const handle = handles[platform as keyof typeof handles];
      if (handle) {
        return `@${handle.replace('@', '')}`;
      }
    }

    return application.influencerUsername ? `@${application.influencerUsername}` : null;
  };

  const getStatusBadge = () => {
    // For pending invitations, show "Invited" badge
    if (application.status === 'pending' && application.applicationType === 'invitation') {
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">Invited</Badge>;
    }

    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
      accepted: { label: 'Approved', variant: 'default' as const, className: '' },
      rejected: { label: 'Declined', variant: 'destructive' as const, className: '' },
      withdrawn: { label: 'Withdrawn', variant: 'outline' as const, className: '' },
    };

    const config = statusConfig[application.status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getInitials = () => {
    const name = application.influencerName || 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const availablePlatforms = application.socialMediaHandles
    ? Object.entries(application.socialMediaHandles)
        .filter(([_, handle]) => handle)
        .map(([platform]) => platform)
    : [];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={application.influencerAvatar} alt={application.influencerName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Name */}
            <h3 className="text-[15px] font-semibold text-gray-900 truncate leading-tight">
              {application.influencerName || 'Unknown'}
            </h3>

            {/* Username/Handle */}
            <div className="text-[13px] text-gray-500 truncate mt-1">
              {getPrimaryHandle() || (application.influencerUsername ? `@${application.influencerUsername}` : '')}
            </div>

            {/* Status Badge */}
            <div className="mt-1">
              {getStatusBadge()}
            </div>

            {/* Social Media Icons Row */}
            {availablePlatforms.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {availablePlatforms.map((platform) => {
                  const Icon = getSocialIcon(platform);
                  const iconColors = getSocialIconColors(platform);
                  const handle = application.socialMediaHandles?.[platform as keyof typeof application.socialMediaHandles];
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
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Visits Count (on the right side) */}
          {application.visitCount !== undefined && application.visitCount > 0 && (
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-gray-900">{application.visitCount}</div>
              <div className="text-xs text-gray-500">visits</div>
            </div>
          )}
        </div>

        {application.applicationMessage && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-2">
              {application.applicationMessage}
            </p>
          </div>
        )}
      </CardContent>

      {application.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(application.id)}
            disabled={isLoading || disabled}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="mr-2 h-4 w-4" />
            Decline
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(application.id)}
            disabled={isLoading || disabled}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
