import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('\nMake sure to run with environment variables loaded:');
  console.log('   source .env.local && npx tsx scripts/debug-campaign.ts <campaign-id>');
  process.exit(1);
}

async function debugCampaign(campaignId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`\nDebugging campaign: ${campaignId}\n`);

  // Check if campaign exists
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error) {
    console.error('❌ Error fetching campaign:', error.message);
    if (error.code === 'PGRST116') {
      console.log('Campaign does not exist in database');
    }
    return;
  }

  if (!campaign) {
    console.log('❌ Campaign not found');
    return;
  }

  console.log('✅ Campaign found:');
  console.log('   ID:', campaign.id);
  console.log('   Title:', campaign.title);
  console.log('   Business ID:', campaign.business_id);
  console.log('   Status:', campaign.status);
  console.log('   Created:', campaign.created_at);

  // Get current authenticated user (you'll need to pass the token)
  console.log('\n📝 To check if this campaign belongs to your user:');
  console.log('   1. Open browser dev tools (F12)');
  console.log('   2. Go to Application/Storage > Cookies or Local Storage');
  console.log('   3. Find your "auth_token" or check localStorage');
  console.log('   4. Verify your user ID matches the business_id above');
}

// Get campaign ID from command line
const campaignId = process.argv[2];
if (!campaignId) {
  console.error('Usage: npx tsx scripts/debug-campaign.ts <campaign-id>');
  process.exit(1);
}

debugCampaign(campaignId);
