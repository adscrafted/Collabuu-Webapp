# Business Profiles Schema Analysis

## Actual Database Columns (30 total)

Based on live database query, the `business_profiles` table contains these columns:

1. `address`
2. `banner_image_url`
3. `business_name`
4. `category`
5. `city`
6. `contact_name`
7. `country`
8. `created_at`
9. `credits_available`
10. `default_campaign_credits_per_visit`
11. `estimated_visits`
12. `facebook_page`
13. `instagram_handle`
14. `is_verified`
15. `linkedin_company`
16. `logo_url`
17. `operating_hours`
18. `phone`
19. `phone_number`
20. `postal_code`
21. `profile_image_url`
22. `social_media_handles`
23. `state`
24. `street_address`
25. `tiktok_handle`
26. `twitter_handle`
27. `updated_at`
28. `user_id`
29. `website`
30. `youtube_channel`

## PUT Handler Attempts to Insert/Update (Lines 206-229 in route.ts)

```javascript
const updateData: any = {
  business_name: businessName,           // ✓ EXISTS
  phone: body.phone,                     // ✓ EXISTS
  phone_number: body.phone,              // ✓ EXISTS
  website: body.website,                 // ✓ EXISTS
  street_address: streetAddress,         // ✓ EXISTS
  city: body.city,                       // ✓ EXISTS
  state: body.state,                     // ✓ EXISTS
  postal_code: postalCode,               // ✓ EXISTS
  country: body.country,                 // ✓ EXISTS
  updated_at: new Date().toISOString(),  // ✓ EXISTS
  instagram_handle: ...,                 // ✓ EXISTS
  tiktok_handle: ...,                    // ✓ EXISTS
  youtube_channel: ...,                  // ✓ EXISTS
  facebook_page: ...,                    // ✓ EXISTS
  twitter_handle: ...,                   // ✓ EXISTS
  linkedin_company: ...,                 // ✓ EXISTS
};
```

## GET Handler Reads (Lines 22-26, 142-174 in route.ts)

The GET handler uses `SELECT *` and then reads these specific fields:

```javascript
// From database (lines 144-150):
- profile.instagram_handle      // ✓ EXISTS
- profile.tiktok_handle         // ✓ EXISTS
- profile.youtube_channel       // ✓ EXISTS
- profile.facebook_page         // ✓ EXISTS
- profile.twitter_handle        // ✓ EXISTS
- profile.linkedin_company      // ✓ EXISTS

// Transformed output (lines 153-174):
- profile.id                    // ✓ user_id EXISTS
- profile.user_id               // ✓ EXISTS
- profile.business_name         // ✓ EXISTS
- user.email                    // From auth.users
- profile.phone                 // ✓ EXISTS
- profile.phone_number          // ✓ EXISTS
- profile.website               // ✓ EXISTS
- profile.street_address        // ✓ EXISTS
- profile.address               // ✓ EXISTS
- profile.city                  // ✓ EXISTS
- profile.state                 // ✓ EXISTS
- profile.postal_code           // ✓ EXISTS
- profile.country               // ✓ EXISTS
- profile.logo_url              // ✓ EXISTS
- profile.profile_image_url     // ✓ EXISTS
- profile.image_urls            // ❌ DOES NOT EXIST (no image_urls column)
- profile.is_verified           // ✓ EXISTS
- profile.created_at            // ✓ EXISTS
- profile.updated_at            // ✓ EXISTS
```

## Logo Upload Handler (logo/route.ts lines 65-72)

```javascript
{
  logo_url: logoUrl,             // ✓ EXISTS
  image_urls: [logoUrl],         // ❌ DOES NOT EXIST
  updated_at: new Date().toISOString(), // ✓ EXISTS
}
```

## FINDINGS

### Column Mismatches

1. **`image_urls` - DOES NOT EXIST**
   - Referenced in GET handler (line 169): `profile.image_urls || []`
   - Referenced in GET handler (line 168): `profile.image_urls?.[0]`
   - **Used in logo upload** (line 69): `image_urls: [logoUrl]`
   - **This is the likely cause of errors**

### Valid Columns Present in Database But Not Used

The following columns exist in the database but are NOT being read or written by the API:

1. `banner_image_url` - Could be used for business banners
2. `category` - Business category (Restaurant, Cafe, etc.)
3. `contact_name` - Contact person name
4. `credits_available` - Available credits (read from transactions instead)
5. `default_campaign_credits_per_visit` - Default credit allocation
6. `estimated_visits` - Estimated traffic
7. `operating_hours` - Business hours (JSONB field)
8. `profile_image_url` - Alternative to logo_url
9. `social_media_handles` - Composite JSONB field (individual columns used instead)

### Redundant Columns

The database has several redundant/duplicate columns:

1. `phone` and `phone_number` (both used)
2. `address` and `street_address` (both exist, street_address preferred)
3. `logo_url` and `profile_image_url` (both exist)
4. Individual social media columns AND `social_media_handles` JSONB field

## RECOMMENDATION

**Immediate Fix Required:**

Remove `image_urls` from:
1. Logo upload handler (line 69 in logo/route.ts)
2. GET handler default response (line 50 in route.ts)
3. GET handler transformation (line 169 in route.ts)

**Alternative Options:**

Option A: Remove `image_urls` references entirely (simpler)
Option B: Add `image_urls` column to database as JSONB array (if needed for multiple images)

Based on the current usage, **Option A is recommended** since:
- Only `logo_url` is actually needed
- There's already `profile_image_url` as backup
- No multi-image functionality is implemented
