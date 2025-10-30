import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractThumbnail, detectPlatform } from '@/lib/utils/thumbnail-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/business/content-submissions/backfill-thumbnails
 *
 * Migration endpoint to regenerate thumbnails for existing content submissions.
 * This endpoint will:
 * 1. Fetch all content submissions with missing or null thumbnails
 * 2. Extract thumbnails from their content URLs
 * 3. Update the database with the extracted thumbnails
 *
 * Usage:
 * - Call this endpoint once to backfill all existing submissions
 * - Optionally pass ?campaignId=xxx to only backfill a specific campaign
 * - Optionally pass ?force=true to regenerate ALL thumbnails (even existing ones)
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user (business owner)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const force = searchParams.get('force') === 'true';

    console.log('[Thumbnail Backfill] Starting backfill process...');
    console.log('[Thumbnail Backfill] Force mode:', force);
    console.log('[Thumbnail Backfill] Campaign filter:', campaignId || 'all campaigns');

    // Build query to fetch content submissions
    let query = supabase
      .from('content_submissions')
      .select('id, content_url, platform, thumbnail_url, campaign_id');

    // If campaignId is provided, only process that campaign
    if (campaignId) {
      // Verify the campaign belongs to this business
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, business_id')
        .eq('id', campaignId)
        .eq('business_id', user.id)
        .single();

      if (campaignError || !campaign) {
        return NextResponse.json(
          { error: 'Campaign not found or access denied' },
          { status: 404 }
        );
      }

      query = query.eq('campaign_id', campaignId);
    } else {
      // Verify access: only process campaigns owned by this business
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('business_id', user.id);

      if (!campaigns || campaigns.length === 0) {
        return NextResponse.json(
          { message: 'No campaigns found for this business' },
          { status: 200 }
        );
      }

      const campaignIds = campaigns.map(c => c.id);
      query = query.in('campaign_id', campaignIds);
    }

    // Filter for missing thumbnails unless force mode is enabled
    if (!force) {
      query = query.or('thumbnail_url.is.null,thumbnail_url.eq.""');
    }

    const { data: submissions, error: fetchError } = await query;

    if (fetchError) {
      console.error('[Thumbnail Backfill] Error fetching submissions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch content submissions' },
        { status: 500 }
      );
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        message: 'No content submissions need thumbnail backfill',
        processed: 0,
        succeeded: 0,
        failed: 0,
      });
    }

    console.log('[Thumbnail Backfill] Found', submissions.length, 'submissions to process');

    // Process each submission
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    for (const submission of submissions) {
      results.processed++;

      try {
        // Auto-detect platform if not set
        const platform = submission.platform || detectPlatform(submission.content_url);

        console.log(
          `[Thumbnail Backfill] Processing ${results.processed}/${submissions.length}:`,
          submission.id,
          'Platform:',
          platform
        );

        // Skip Instagram - not supported due to bot detection
        if (platform === 'instagram') {
          console.log('[Thumbnail Backfill] Skipping Instagram (not supported)');
          results.failed++;
          results.errors.push({
            id: submission.id,
            error: 'Instagram thumbnails not supported (blocked by bot detection)',
          });
          continue;
        }

        // Extract thumbnail (only YouTube and TikTok supported)
        const thumbnailResult = await extractThumbnail(submission.content_url, platform);

        if (thumbnailResult.error) {
          console.warn(
            '[Thumbnail Backfill] Warning for',
            submission.id,
            ':',
            thumbnailResult.error
          );
        }

        if (thumbnailResult.thumbnailUrl) {
          // Update the submission with the extracted thumbnail
          const { error: updateError } = await supabase
            .from('content_submissions')
            .update({
              thumbnail_url: thumbnailResult.thumbnailUrl,
              platform: platform, // Also update platform if it was auto-detected
            })
            .eq('id', submission.id);

          if (updateError) {
            console.error('[Thumbnail Backfill] Update error for', submission.id, ':', updateError);
            results.failed++;
            results.errors.push({
              id: submission.id,
              error: updateError.message,
            });
          } else {
            console.log('[Thumbnail Backfill] ✓ Updated', submission.id, 'with thumbnail:', thumbnailResult.thumbnailUrl);
            results.succeeded++;
          }
        } else {
          console.warn('[Thumbnail Backfill] No thumbnail extracted for', submission.id);
          results.failed++;
          results.errors.push({
            id: submission.id,
            error: thumbnailResult.error || 'Failed to extract thumbnail',
          });
        }

        // Add a small delay to avoid rate limiting from external APIs
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('[Thumbnail Backfill] Error processing', submission.id, ':', error);
        results.failed++;
        results.errors.push({
          id: submission.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('[Thumbnail Backfill] Completed!');
    console.log('[Thumbnail Backfill] Results:', {
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
    });

    return NextResponse.json({
      message: 'Thumbnail backfill completed',
      ...results,
    });
  } catch (error) {
    console.error('[Thumbnail Backfill] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
