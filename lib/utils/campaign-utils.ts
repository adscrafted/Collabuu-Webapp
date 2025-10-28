import { Campaign, CampaignType } from '@/lib/types/campaign';

/**
 * Determines if the Influencers tab should be shown for a campaign
 * LOYALTY_REWARD campaigns don't show the Influencers tab
 */
export function shouldShowInfluencersTab(campaign: Campaign): boolean {
  return campaign.type !== CampaignType.LOYALTY_REWARD;
}

/**
 * Determines if the Content tab should be shown for a campaign
 * LOYALTY_REWARD campaigns don't show the Content tab
 */
export function shouldShowContentTab(campaign: Campaign): boolean {
  return campaign.type !== CampaignType.LOYALTY_REWARD;
}

/**
 * Gets a user-friendly label for a campaign type
 */
export function getCampaignTypeLabel(type: CampaignType): string {
  const labels = {
    [CampaignType.PAY_PER_CUSTOMER]: 'Pay Per Customer',
    [CampaignType.PAY_PER_POST]: 'Pay Per Post',
    [CampaignType.MEDIA_EVENT]: 'Media Event',
    [CampaignType.LOYALTY_REWARD]: 'Loyalty Reward',
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
    case CampaignType.LOYALTY_REWARD:
      return 'Actual Visitors';
    case CampaignType.MEDIA_EVENT:
      return 'Influencer Spots';
    case CampaignType.PAY_PER_POST:
      return 'Total Posts';
    case CampaignType.PAY_PER_CUSTOMER:
    default:
      return 'Total Visitors';
  }
}

/**
 * Determines if credit breakdown should be shown
 * LOYALTY_REWARD and MEDIA_EVENT campaigns hide the credit breakdown section
 * iOS behavior: commission breakdown is hidden for media events
 */
export function shouldShowCreditBreakdown(campaign: Campaign): boolean {
  return campaign.type !== CampaignType.LOYALTY_REWARD && campaign.type !== CampaignType.MEDIA_EVENT;
}

/**
 * Gets formatted influencer spots for campaigns
 */
export function getInfluencerSpotsText(campaign: Campaign): string {
  const total = campaign.influencerSpots ?? 0;
  const filled = campaign.influencerCount ?? 0;

  return `${filled}/${total} spots filled`;
}

/**
 * Checks if influencer spots are available
 */
export function hasAvailableSpots(campaign: Campaign): boolean {
  const total = campaign.influencerSpots ?? 0;
  const filled = campaign.influencerCount ?? 0;

  return filled < total;
}

/**
 * Gets the fixed credit value for media events
 */
export function getMediaEventCredits(): number {
  return 300;
}
