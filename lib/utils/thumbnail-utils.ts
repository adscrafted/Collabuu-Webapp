/**
 * Thumbnail Extraction Utilities
 *
 * Extracts thumbnail URLs from social media platform links.
 * Supports: YouTube, Instagram, TikTok
 */

export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'other';

export interface ThumbnailResult {
  thumbnailUrl: string | null;
  error?: string;
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get YouTube thumbnail from video URL
 * Returns highest quality thumbnail available (maxresdefault > sddefault > hqdefault > mqdefault)
 */
export async function getYouTubeThumbnail(url: string): Promise<ThumbnailResult> {
  try {
    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      return {
        thumbnailUrl: null,
        error: 'Could not extract YouTube video ID'
      };
    }

    // YouTube thumbnail URL patterns (in order of quality)
    const thumbnailQualities = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 1280x720
      `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,     // 640x480
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // 480x360
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // 320x180
    ];

    // Try to find the highest quality thumbnail that exists
    for (const thumbnailUrl of thumbnailQualities) {
      try {
        const response = await fetch(thumbnailUrl, { method: 'HEAD' });
        if (response.ok) {
          return { thumbnailUrl };
        }
      } catch (e) {
        // Continue to next quality
      }
    }

    // Fallback to default thumbnail (always exists)
    return {
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/default.jpg`
    };
  } catch (error) {
    return {
      thumbnailUrl: null,
      error: error instanceof Error ? error.message : 'Failed to get YouTube thumbnail'
    };
  }
}

/**
 * Get Instagram thumbnail
 *
 * IMPORTANT: Instagram blocks server-side thumbnail extraction due to bot detection.
 * Both the oEmbed API and HTML scraping are blocked from Node.js/server environments.
 *
 * Future solutions:
 * 1. Instagram Graph API (requires user OAuth + Instagram Business account)
 * 2. Third-party service like Iframely ($50-100/month)
 * 3. Manual thumbnail upload by users
 *
 * For now, return null and let the UI show a fallback (platform icon or placeholder).
 * The Instagram embed will still work in the modal view.
 */
export async function getInstagramThumbnail(url: string): Promise<ThumbnailResult> {
  return {
    thumbnailUrl: null,
    error: 'Instagram thumbnails require manual upload or API integration (blocked by bot detection)'
  };
}

/**
 * Get TikTok thumbnail using oEmbed API
 */
export async function getTikTokThumbnail(url: string): Promise<ThumbnailResult> {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

    const response = await fetch(oembedUrl);

    if (!response.ok) {
      return {
        thumbnailUrl: null,
        error: 'TikTok oEmbed API request failed'
      };
    }

    const data = await response.json();

    return {
      thumbnailUrl: data.thumbnail_url || null
    };
  } catch (error) {
    return {
      thumbnailUrl: null,
      error: error instanceof Error ? error.message : 'Failed to get TikTok thumbnail'
    };
  }
}

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): Platform {
  const lowercaseUrl = url.toLowerCase();

  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowercaseUrl.includes('instagram.com')) {
    return 'instagram';
  }
  if (lowercaseUrl.includes('tiktok.com')) {
    return 'tiktok';
  }

  return 'other';
}

/**
 * Main function to extract thumbnail from any supported platform
 *
 * @param url - The social media content URL
 * @param platform - Optional platform hint (will auto-detect if not provided)
 * @returns Thumbnail URL or null if extraction fails
 */
export async function extractThumbnail(
  url: string,
  platform?: Platform
): Promise<ThumbnailResult> {
  const detectedPlatform = platform || detectPlatform(url);

  switch (detectedPlatform) {
    case 'youtube':
      return getYouTubeThumbnail(url);
    case 'instagram':
      return getInstagramThumbnail(url);
    case 'tiktok':
      return getTikTokThumbnail(url);
    default:
      return {
        thumbnailUrl: null,
        error: 'Unsupported platform or URL format'
      };
  }
}

/**
 * Batch extract thumbnails for multiple URLs
 * Useful for migration/backfill operations
 */
export async function extractThumbnailsBatch(
  items: Array<{ url: string; platform?: Platform }>
): Promise<Array<ThumbnailResult>> {
  return Promise.all(
    items.map(item => extractThumbnail(item.url, item.platform))
  );
}
