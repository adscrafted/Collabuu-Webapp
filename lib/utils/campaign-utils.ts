import { Campaign, CampaignType } from '@/lib/types/campaign';

/**
 * Determines if the Influencers tab should be shown for a campaign
 * REWARDS campaigns don't show the Influencers tab
 */
export function shouldShowInfluencersTab(campaign: Campaign): boolean {
  return campaign.type !== CampaignType.REWARDS;
}

/**
 * Determines if the Content tab should be shown for a campaign
 * REWARDS campaigns don't show the Content tab
 */
export function shouldShowContentTab(campaign: Campaign): boolean {
  return campaign.type !== CampaignType.REWARDS;
}

/**
 * Gets a user-friendly label for a campaign type
 */
export function getCampaignTypeLabel(type: CampaignType): string {
  const labels = {
    [CampaignType.PAY_PER_CUSTOMER]: 'Pay Per Customer',
    [CampaignType.MEDIA_EVENT]: 'Media Event',
    [CampaignType.REWARDS]: 'Rewards',
  };
  return labels[type] || type;
}

/**
 * Gets the event type label for media events (based on visibility)
 */
export function getEventTypeLabel(visibility: 'public' | 'private'): string {
  return visibility === 'public' ? 'Public Event' : 'Private Event';
}

/**
 * Checks if a media event has passed (invitations should be locked)
 */
export function isMediaEventPassed(campaign: Campaign): boolean {
  if (campaign.type !== CampaignType.MEDIA_EVENT || !campaign.eventDate) {
    return false;
  }

  const eventDate = new Date(campaign.eventDate);
  const now = new Date();

  return eventDate < now;
}

/**
 * Determines what primary metric should be shown for a campaign type
 */
export function getPrimaryMetricLabel(campaign: Campaign): string {
  switch (campaign.type) {
    case CampaignType.REWARDS:
      return 'Actual Visitors';
    case CampaignType.MEDIA_EVENT:
      return 'Influencer Spots';
    case CampaignType.PAY_PER_CUSTOMER:
    default:
      return 'Total Visitors';
  }
}

/**
 * Determines if credit breakdown should be shown
 * REWARDS and MEDIA_EVENT campaigns hide the credit breakdown section
 * iOS behavior: commission breakdown is hidden for media events
 */
export function shouldShowCreditBreakdown(campaign: Campaign): boolean {
  return campaign.type !== CampaignType.REWARDS && campaign.type !== CampaignType.MEDIA_EVENT;
}

/**
 * Gets formatted influencer spots for media events
 */
export function getInfluencerSpotsText(campaign: Campaign): string | null {
  if (campaign.type !== CampaignType.MEDIA_EVENT) {
    return null;
  }

  const filled = campaign.budget?.influencerSpotsFilled || 0;
  const total = campaign.budget?.influencerSpots || 0;

  return `${filled} / ${total}`;
}

/**
 * Checks if influencer spots are available for media events
 */
export function hasAvailableSpots(campaign: Campaign): boolean {
  if (campaign.type !== CampaignType.MEDIA_EVENT) {
    return true; // Other types don't have spot limitations
  }

  const filled = campaign.budget?.influencerSpotsFilled || 0;
  const total = campaign.budget?.influencerSpots || 0;

  return filled < total;
}

/**
 * Gets the fixed credit value for media events
 */
export function getMediaEventCredits(): number {
  return 300;
}
