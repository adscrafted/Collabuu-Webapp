'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, ExternalLink, Instagram, Youtube, User } from 'lucide-react';
import { InfluencerApplication } from '@/lib/types/campaign';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

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
  const [showProfile, setShowProfile] = useState(false);

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      instagram: Instagram,
      youtube: Youtube,
    };
    const Icon = icons[platform.toLowerCase()] || ExternalLink;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={application.influencerAvatar} alt={application.influencerName} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {application.influencerName}
                  </h3>
                  <Badge variant="secondary">
                    {application.followerCount.toLocaleString()} followers
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Applied {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                </p>
              </div>

              {application.applicationMessage && (
                <p className="text-sm text-gray-700">{application.applicationMessage}</p>
              )}

              {application.socialMediaLinks && application.socialMediaLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {application.socialMediaLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      {getSocialIcon(link.platform)}
                      {link.platform}
                      <span className="ml-1 text-gray-500">
                        ({link.followers.toLocaleString()})
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {application.portfolioImages && application.portfolioImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {application.portfolioImages.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200"
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  {application.portfolioImages.length > 3 && (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                      <p className="text-xs font-medium text-gray-600">
                        +{application.portfolioImages.length - 3}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Engagement Rate:</span>
                <Badge variant="outline">{application.engagementRate.toFixed(1)}%</Badge>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
          <Dialog open={showProfile} onOpenChange={setShowProfile}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{application.influencerName}</DialogTitle>
                <DialogDescription>Full influencer profile and portfolio</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={application.influencerAvatar}
                      alt={application.influencerName}
                    />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{application.influencerName}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge>{application.followerCount.toLocaleString()} followers</Badge>
                      <Badge variant="outline">
                        {application.engagementRate.toFixed(1)}% engagement
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 font-semibold">Application Message</h4>
                  <p className="text-sm text-gray-700">{application.applicationMessage}</p>
                </div>

                {application.socialMediaLinks && application.socialMediaLinks.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-2 font-semibold">Social Media</h4>
                      <div className="space-y-2">
                        {application.socialMediaLinks.map((link) => (
                          <a
                            key={link.platform}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              {getSocialIcon(link.platform)}
                              <span className="font-medium capitalize">{link.platform}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{link.followers.toLocaleString()} followers</span>
                              <ExternalLink className="h-4 w-4" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {application.portfolioImages && application.portfolioImages.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-2 font-semibold">Portfolio</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {application.portfolioImages.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square overflow-hidden rounded-lg border border-gray-200"
                          >
                            <img
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(application.id)}
              disabled={isLoading || disabled}
              className="text-red-600 hover:text-red-700"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onAccept(application.id)}
              disabled={isLoading || disabled}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
