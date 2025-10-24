# Campaign Creation Multi-Step Form - Implementation Guide

## Overview

A comprehensive multi-step wizard for creating marketing campaigns in the Collabuu webapp. This implementation matches the iOS app design with 4 progressive steps, form validation, and draft saving functionality.

## Features

- **4-Step Wizard**: Campaign Type → Basic Info → Details → Review
- **Progressive Validation**: Step-by-step form validation with Zod schemas
- **Draft Auto-Save**: Automatic localStorage persistence
- **Image Upload**: Drag-and-drop image uploader with preview
- **Budget Calculator**: Real-time budget calculation with warnings
- **Date Range Picker**: Calendar-based date selection with validation
- **Responsive Design**: Mobile-friendly with shadcn/ui components
- **Toast Notifications**: Success/error feedback
- **Unsaved Changes Warning**: Confirmation dialog on cancel

## File Structure

### Core Page
```
/app/(dashboard)/campaigns/new/page.tsx
```
Main wizard component with stepper, form state management, and navigation.

### Step Components
```
/components/campaigns/steps/
├── campaign-type-step.tsx      # Step 1: Campaign type selection
├── basic-info-step.tsx          # Step 2: Title, description, image
├── campaign-details-step.tsx    # Step 3: Budget, dates, requirements
└── review-step.tsx              # Step 4: Review and publish
```

### Form Components
```
/components/campaigns/form/
├── image-uploader.tsx          # Drag-drop image upload with preview
├── date-range-picker.tsx       # Date range selector with duration display
├── budget-calculator.tsx       # Real-time budget breakdown
└── requirements-form.tsx       # Optional campaign requirements
```

### Validation & Types
```
/lib/validation/campaign-schema.ts   # Zod validation schemas
/lib/types/campaign.ts               # TypeScript types and interfaces
```

### API & Hooks
```
/lib/api/campaigns.ts                # API client functions
/lib/hooks/use-create-campaign.ts    # React Query mutations
/components/ui/use-toast.ts          # Toast notification hook
```

## Campaign Types

### 1. Pay Per Customer
- **Icon**: 👥
- **Description**: Pay for each customer visit
- **Budget**: Variable (Credits per visit × Max visits)
- **Use Case**: Restaurants, cafes, retail stores driving foot traffic

### 2. Media Event
- **Icon**: 📸
- **Description**: Fixed price for event coverage
- **Budget**: Fixed 300 credits
- **Settings**: Number of influencer spots (1-50)
- **Use Case**: Product launches, grand openings, special events

### 3. Loyalty Reward
- **Icon**: 🎁
- **Description**: Reward repeat customers
- **Budget**: Variable (Reward value × Redemptions)
- **Settings**: Reward value and max redemptions per customer
- **Use Case**: Building customer loyalty and repeat visits

## Step Details

### Step 1: Campaign Type Selection
**Components**: `campaign-type-step.tsx`

Features:
- 3 interactive cards with hover effects
- Active state with pink border and checkmark
- Icon, title, description, pricing model
- Example use cases
- Info box with help text

Validation:
- Must select one campaign type

### Step 2: Basic Information
**Components**: `basic-info-step.tsx`, `image-uploader.tsx`

Fields:
- Campaign Title (10-60 characters, required)
- Description (50-500 characters, required)
- Campaign Image (optional, recommended)
- Category (optional)
- Tags (optional, comma-separated)

Features:
- Character counters with color indicators
- Drag-and-drop image upload
- Image preview with crop capability
- Upload to Supabase Storage
- Pro tips box with best practices

Validation:
- Title: 10-60 characters
- Description: 50-500 characters
- Image: Max 5MB, JPG/PNG/WebP
- Recommended aspect ratio: 16:9

### Step 3: Campaign Details
**Components**: `campaign-details-step.tsx`, `date-range-picker.tsx`, `budget-calculator.tsx`, `requirements-form.tsx`

Campaign Schedule:
- Start date (today or future)
- End date (after start date)
- Duration display (X days)
- Tips for optimal duration

Budget Settings (varies by type):

**Pay Per Customer**:
- Credits per visit (1-100)
- Maximum visits (min 1)
- Total = credits × visits

**Media Event**:
- Fixed 300 credits
- Influencer spots (1-50)

**Loyalty Reward**:
- Reward value (min 1 credit)
- Max redemptions per customer (min 1)

Requirements (Optional):
- Minimum follower count
- Required hashtags (multi-input with chips)
- Location requirements
- Age restrictions (min/max)

Budget Calculator Sidebar:
- Real-time total calculation
- Available credits display
- Remaining credits after campaign
- Over-budget warning (red alert)
- High-budget warning (80%+ usage, amber alert)
- Estimated reach display

### Step 4: Review & Publish
**Components**: `review-step.tsx`

Sections:
1. **Campaign Type** (editable, click to go back)
2. **Basic Information** (with image preview)
3. **Campaign Details** (schedule, budget, requirements)
4. **Terms & Conditions**
   - Checkbox for acceptance (required)
   - Links to Terms of Service and Privacy Policy
5. **Publish Options**
   - Checkbox for "Publish immediately"
   - If unchecked, saves as draft
6. **Credit Deduction Notice**
   - Warning about credit deduction
   - Different message for draft vs publish

Features:
- Edit buttons on each section
- All data displayed in organized cards
- Visual badges for tags and hashtags
- Credit calculation summary
- Important notices with icons

## Form Validation

### Zod Schemas
Located in `/lib/validation/campaign-schema.ts`

**Individual Step Schemas**:
- `campaignTypeSchema`: Type selection
- `basicInfoSchema`: Title, description, image
- `campaignDetailsSchema`: Dates, budget, requirements
- `reviewSchema`: Terms acceptance

**Combined Schema**:
- `campaignFormSchema`: All fields with cross-field validation
- Date range validation (end > start, start >= today)
- Type-specific budget validation
- Age restrictions validation (13-100 years)

### Custom Validators
- Budget validation based on campaign type
- Pay Per Customer: requires creditsPerVisit and maxVisits
- Media Event: requires influencerSpots
- Loyalty Reward: requires rewardValue and maxRedemptionsPerCustomer
- Available credits check (client-side, server validates too)

## State Management

### Form State
- **Library**: react-hook-form with Zod resolver
- **Mode**: onChange validation for real-time feedback
- **Default Values**: Pre-filled with sensible defaults

### Local Storage Persistence
- Auto-save on every form change
- Key: `campaign-form-draft`
- Excluded: imageFile (not serializable)
- Auto-restore on page reload
- Cleared on successful submission or cancel

### Navigation State
- Current step tracking (0-3)
- Step validation before proceeding
- Back navigation without validation
- Unsaved changes warning

## API Integration

### Endpoints Used
```typescript
POST /campaigns              // Create campaign
POST /campaigns/upload-image // Upload image file
GET  /campaigns              // List campaigns
GET  /campaigns/:id          // Get campaign details
```

### React Query Mutations

**useCreateCampaign()**:
- Uploads image if provided
- Creates campaign with all data
- Invalidates campaigns list cache
- Shows success toast
- Redirects to campaign detail page

**useSaveDraft()**:
- Same flow but sets status to DRAFT
- No credit deduction
- Shows "Draft Saved" toast

**useUploadCampaignImage()**:
- Standalone image upload
- Returns URL for form storage
- Error handling with toast

## UI Components Used

### shadcn/ui Components
- `Button`: Navigation, actions
- `Card`: Section containers
- `Input`: Text fields
- `Textarea`: Description field
- `Label`: Form labels
- `Checkbox`: Terms, publish options
- `Badge`: Category, tags display
- `Separator`: Visual dividers
- `Dialog`: Cancel confirmation
- `Calendar`: Date selection
- `Popover`: Calendar popover
- `Alert`: Warnings and notices
- `Skeleton`: Loading states

### Custom Components
- `ImageUploader`: Drag-drop upload
- `DateRangePicker`: Date range selector
- `BudgetCalculator`: Budget summary
- `RequirementsForm`: Optional requirements

## Styling & Design

### Color Scheme
- **Primary**: Pink (#EC4899)
- **Success**: Green
- **Warning**: Amber
- **Error**: Red
- **Neutral**: Gray scale

### Responsive Breakpoints
- Mobile: < 768px (stacked layout)
- Tablet: 768px - 1024px
- Desktop: > 1024px (sidebar layout)

### Animations
- Smooth transitions between steps
- Hover effects on cards
- Button press animations
- Toast slide-in animations

## User Experience Features

### Progressive Disclosure
- Only show relevant fields per step
- Type-specific budget fields
- Conditional validation

### Visual Feedback
- Character counters
- Real-time validation errors
- Budget warnings
- Duration calculations
- Loading states

### Help Text
- Field descriptions
- Example values
- Pro tips boxes
- Info boxes with best practices
- Warning alerts

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader friendly
- High contrast ratios

## Testing Checklist

### Functionality
- [ ] All three campaign types selectable
- [ ] Form validation works at each step
- [ ] Can't proceed with invalid data
- [ ] Character counters accurate
- [ ] Image upload and preview works
- [ ] Date picker prevents invalid dates
- [ ] Budget calculator updates in real-time
- [ ] Hashtag input and removal works
- [ ] Draft auto-save to localStorage
- [ ] Draft restore on page reload
- [ ] Cancel confirmation appears with unsaved changes
- [ ] Submit creates campaign successfully
- [ ] Redirects after successful creation
- [ ] Toast notifications display correctly

### Edge Cases
- [ ] Over budget warning appears
- [ ] High budget warning appears (80%+)
- [ ] End date before start date blocked
- [ ] Start date in past blocked
- [ ] Character limits enforced
- [ ] Image size limit enforced
- [ ] Required fields highlighted when empty
- [ ] Terms must be accepted to publish

### Responsive Design
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout with sidebar
- [ ] Touch-friendly on mobile
- [ ] Stepper adapts to screen size

### Performance
- [ ] No unnecessary re-renders
- [ ] Image preview efficient
- [ ] Form state updates smooth
- [ ] Navigation instant

## Future Enhancements

### Potential Additions
1. **Image Cropping**: In-browser image crop/resize
2. **Image Filters**: Apply filters before upload
3. **Multi-Image Upload**: Support multiple campaign images
4. **Rich Text Editor**: Enhanced description formatting
5. **Template Library**: Pre-made campaign templates
6. **A/B Testing**: Create campaign variations
7. **Scheduling**: Schedule publish for future date
8. **Budget Optimizer**: AI-powered budget suggestions
9. **Audience Insights**: Target audience recommendations
10. **Preview Mode**: Live preview of how campaign appears

### Technical Improvements
1. **Server-Side Validation**: Duplicate client-side validation on backend
2. **Rate Limiting**: Prevent spam campaign creation
3. **Image Optimization**: Auto-optimize uploaded images
4. **CDN Integration**: Faster image delivery
5. **Analytics Tracking**: Track wizard completion rates
6. **Error Boundaries**: Better error handling
7. **Offline Support**: Work offline with queue sync
8. **Multi-Language**: i18n support

## Troubleshooting

### Common Issues

**Issue**: Form not saving to localStorage
- Check browser localStorage is enabled
- Check quota limits (usually 5-10MB)
- Clear old drafts if needed

**Issue**: Image upload fails
- Check file size < 5MB
- Verify file type is JPG/PNG/WebP
- Check network connection
- Verify API endpoint is correct

**Issue**: Validation not triggering
- Ensure Zod schema is imported correctly
- Check resolver is configured in useForm
- Verify field names match schema

**Issue**: Budget calculator shows wrong total
- Check useEffect dependencies
- Verify calculation logic for campaign type
- Console log intermediate values

## API Requirements

### Backend Endpoints Needed

```typescript
POST /campaigns
Request Body:
{
  type: CampaignType;
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  budget: {
    creditsPerVisit?: number;
    maxVisits?: number;
    influencerSpots?: number;
    rewardValue?: number;
    maxRedemptionsPerCustomer?: number;
    totalCredits: number;
  };
  requirements?: {
    minFollowerCount?: number;
    requiredHashtags?: string[];
    locationRequirements?: string;
    ageRestrictions?: { min?: number; max?: number; };
  };
  status: CampaignStatus; // DRAFT or ACTIVE
}

Response:
{
  id: string;
  businessId: string;
  // ... all fields from request
  createdAt: string;
  updatedAt: string;
}

POST /campaigns/upload-image
Content-Type: multipart/form-data
Body: image file

Response:
{
  url: string; // URL to uploaded image
}
```

### Authorization
- Requires valid auth token in Authorization header
- Requires business-id in X-Business-Id header
- Verify business has sufficient credits before allowing campaign creation

## Dependencies

### Required npm Packages
All dependencies are already in package.json:
- react-hook-form: ^7.65.0
- @hookform/resolvers: ^5.2.2
- zod: ^4.1.12
- @tanstack/react-query: ^5.90.5
- date-fns: ^4.1.0
- lucide-react: ^0.546.0
- All shadcn/ui dependencies

## Support & Maintenance

### Contact
For issues or questions about this implementation, contact the development team.

### Code Owners
- Frontend: Campaign Creation Wizard
- Backend: Campaign API endpoints
- Design: Campaign UI/UX

### Documentation
- Figma Designs: [Link to iOS app designs]
- API Docs: [Link to API documentation]
- Style Guide: [Link to design system]
