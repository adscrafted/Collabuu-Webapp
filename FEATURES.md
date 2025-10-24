# Features Documentation

Complete documentation of all features implemented in the Collabuu web application.

## Table of Contents

- [Authentication](#authentication)
- [Campaign Management](#campaign-management)
- [Credit System](#credit-system)
- [Profile Management](#profile-management)
- [UI Components](#ui-components)

## Authentication

### User Registration

**Location**: `/register`

**Features**:
- Email and password registration
- Business profile creation
- Form validation with Zod
- Password strength requirements
- Terms and conditions acceptance
- Email verification flow (via Supabase)

**User Flow**:
1. User fills registration form
2. Validation checks (email format, password strength, required fields)
3. Account created in Supabase
4. Business profile created via backend API
5. Redirect to dashboard

**Technical Details**:
- Uses `react-hook-form` with `zod` validation
- Supabase Auth for account creation
- JWT tokens stored in localStorage
- Automatic token refresh on expiration

---

### User Login

**Location**: `/login`

**Features**:
- Email and password authentication
- "Remember me" functionality
- Password reset link
- Error handling for invalid credentials
- Automatic redirect to dashboard on success

**User Flow**:
1. User enters credentials
2. Authentication via Supabase
3. Tokens retrieved and stored
4. User profile fetched from backend
5. Redirect to dashboard

**Technical Details**:
- Supabase Auth integration
- JWT token management
- Axios interceptors for auth headers
- Automatic token refresh

---

### Protected Routes

**Implementation**: `middleware.ts`

**Features**:
- Automatic redirect to login if unauthenticated
- Token validation
- Role-based access control (business users only)

**Protected Routes**:
- `/dashboard`
- `/campaigns`
- `/profile`
- `/credits`

---

## Campaign Management

### Campaign List View

**Location**: `/campaigns`

**Features**:
- Grid/List view of all campaigns
- Campaign status badges (Active, Draft, Paused, Completed, Cancelled)
- Campaign type indicators
- Statistics display (participants, visits, credits spent)
- Filter by status, type, date range
- Search functionality
- Sort options (newest, oldest, most visits, end date)
- Pagination
- Empty state for no campaigns

**Filter Options**:
- Status: All, Active, Draft, Paused, Completed, Cancelled
- Type: All, Pay Per Customer, Media Event, Loyalty Reward
- Date range picker
- Search by title/description

**Actions**:
- Create new campaign
- View campaign details
- Edit campaign
- Duplicate campaign
- Delete campaign
- Change status (pause/resume)

---

### Campaign Creation Wizard

**Location**: `/campaigns/new`

**Features**:
- Multi-step form (4 steps)
- Progress indicator
- Form validation
- Auto-save drafts
- Image upload
- Budget calculator

**Step 1: Campaign Type**
- Three campaign types to choose from:
  - Pay Per Customer
  - Media Event
  - Loyalty Reward
- Type description and pricing model
- Example use cases

**Step 2: Basic Information**
- Campaign title
- Description (rich text)
- Category selection
- Tags
- Campaign image upload (drag & drop)
- Image preview

**Step 3: Campaign Details**
- Date range picker (start and end dates)
- Budget configuration:
  - Pay Per Customer: Credits per visit, max visits
  - Media Event: Number of influencer spots
  - Loyalty Reward: Reward value, max redemptions
- Total credits calculation
- Requirements:
  - Minimum follower count
  - Required hashtags
  - Location requirements
  - Age restrictions

**Step 4: Review & Publish**
- Campaign summary
- Edit any step
- Terms acceptance
- Publish options:
  - Save as draft
  - Publish immediately
- Credit deduction confirmation

---

### Campaign Detail View

**Location**: `/campaigns/[id]`

**Features**:
- Tabbed interface
- Campaign status management
- Real-time statistics
- Influencer management

**Overview Tab**:
- Campaign information
- Status badge
- Start and end dates
- Budget breakdown
- Requirements list
- Edit button
- Actions: Pause, Resume, Complete, Delete

**Influencers Tab**:
- Active participants list
- Participant cards with:
  - Avatar and name
  - Follower count
  - Visits generated
  - Credits earned
  - Conversion rate
  - Last activity
- Pending applications section
- Application approval/rejection
- Remove participant option

---

### Campaign Editing

**Location**: `/campaigns/[id]/edit`

**Features**:
- Pre-filled form with existing data
- Same wizard interface as creation
- Validation for active campaigns
- Update confirmation
- Cancel and discard changes

**Restrictions**:
- Cannot change campaign type
- Limited edits for active campaigns
- Credit adjustment validation

---

## Credit System

**Location**: `/credits`

### Credit Balance Display

**Features**:
- Current balance prominent display
- Recent transaction summary
- Low balance warning
- Credit usage chart

---

### Credit Packages

**Available Packages**:
1. **Starter** - 100 credits for $10
   - Best for testing
   - No expiration

2. **Popular** - 500 credits for $45
   - 10% discount
   - Most popular

3. **Professional** - 1000 credits for $80
   - 20% discount
   - For growing businesses

4. **Enterprise** - 2500 credits for $180
   - 28% discount
   - Best value

**Features**:
- Package cards with pricing
- Popular badge
- Discount percentage
- Savings calculation
- Secure checkout

---

### Stripe Checkout Integration

**Features**:
- Stripe Checkout Session
- Payment methods:
  - Credit/Debit cards
  - Apple Pay
  - Google Pay
- Secure payment processing
- 3D Secure authentication
- Payment confirmation
- Receipt via email

**Checkout Flow**:
1. Select package
2. Click "Purchase"
3. Redirect to Stripe Checkout
4. Enter payment details
5. Confirm payment
6. Process webhook
7. Credits added to account
8. Redirect to dashboard with success message

---

### Transaction History

**Features**:
- All transactions listed
- Transaction types:
  - Purchase
  - Campaign Spend
  - Refund
  - Adjustment
- Date and time
- Amount (credits)
- Description
- Status badge
- Payment method
- Invoice download
- Pagination
- Filter by type
- Search functionality

---

## Profile Management

**Location**: `/profile`

### Business Profile Tab

**Features**:
- Business information display
- Edit mode
- Form validation
- Image upload for logo
- Auto-save

**Editable Fields**:
- Business name
- Description
- Phone number
- Website URL
- Physical address
- Category
- Social media links (Instagram, Facebook, Twitter)

---

### Settings Tab

**Features**:
- Account settings
- Email management
- Password management
- Privacy settings

**Actions**:
- Change email (with verification)
- Change password (requires current password)
- Two-factor authentication setup

---

### Team Members Tab

**Features**:
- Team member list
- Member cards with:
  - Avatar
  - Name
  - Email
  - Role
  - Status (Active, Pending)
  - Last active
- Invite new members
- Edit member role
- Remove member

**Invite Process**:
1. Click "Invite Member"
2. Enter email and role
3. Send invitation
4. Email sent with link
5. Member accepts and creates account
6. Added to team

---

### Billing Tab

**Features**:
- Current credit balance
- Recent transactions (last 5)
- Payment methods on file
- Invoice history
- Downloadable invoices
- Update payment method link

---

## UI Components

### Design System

**Built with**:
- shadcn/ui components
- Radix UI primitives
- Tailwind CSS
- Custom color palette
- Consistent spacing system

### Available Components

**Form Components**:
- Input
- Textarea
- Select
- Checkbox
- Radio Group
- Switch
- Calendar
- Date Picker

**Feedback Components**:
- Toast notifications (Sonner)
- Alert Dialog
- Confirmation Modal
- Loading Skeleton
- Progress Bar
- Badge
- Alert

**Layout Components**:
- Card
- Tabs
- Accordion
- Separator
- Scroll Area
- Dialog/Modal
- Popover
- Dropdown Menu

**Navigation**:
- Sidebar
- Dashboard Header
- Mobile Navigation
- Breadcrumbs
- Pagination

**Data Display**:
- Table
- Avatar
- Badge
- Skeleton
- Empty State

---

## Responsive Design

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Features

- Hamburger menu
- Collapsible sidebar
- Touch-optimized buttons
- Swipe gestures
- Mobile-friendly forms
- Responsive tables
- Adaptive charts

### Desktop Features

- Full sidebar navigation
- Multi-column layouts
- Hover states
- Keyboard shortcuts
- Advanced filtering
- Bulk actions

---

## Accessibility Features

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader optimizations
- High contrast mode support
- Semantic HTML
- Alt text for images
- Form label associations

---

## Performance Optimizations

- Code splitting with Next.js
- Image optimization
- Lazy loading
- React Query caching
- Optimistic updates
- Server-side rendering
- Static generation where possible
- Bundle size optimization

---

**Last Updated**: October 2024
