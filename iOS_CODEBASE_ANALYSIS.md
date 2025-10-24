# Collabuu iOS App - Comprehensive Codebase Analysis

## 1. PROJECT STRUCTURE & ARCHITECTURE

### Directory Organization
```
/Users/anthony/Documents/Projects/Collabuu/
├── Auth/                          # Authentication screens & logic
├── Business/                       # Business user features
│   ├── Navigation/
│   ├── Pages/
│   │   ├── Campaigns/            # Campaign management
│   │   ├── Profile/              # Business profile, credits purchase
│   │   ├── Messages/             # Business messaging
│   │   ├── Admin/                # Withdrawal requests
│   │   ├── Scan/                 # QR code scanning (if applicable)
│   │   └── Onboarding/           # Business signup flow
├── Influencer/                     # Influencer-specific features
│   ├── Pages/
│   │   ├── Campaigns/            # Opportunities & applications
│   │   ├── Messages/             # Influencer messaging
│   │   ├── Profile/              # Profile, credit withdrawal
│   │   ├── Opportunities/        # Campaign opportunities
│   │   └── Onboarding/           # Influencer signup
├── Customer/                       # Customer features (rewards)
├── Core/                          # Core infrastructure
│   ├── Navigation/               # Tab bar configuration
├── Shared/                        # Shared across all user types
│   ├── Styles/                   # Design system (colors, typography, spacing)
│   ├── Components/               # Reusable UI components
│   ├── Services/                 # API service, storage, auth
│   ├── Models/                   # Data models
│   ├── Utilities/                # Helper functions
│   └── Views/                    # Shared views
├── Supabase/                      # Supabase backend integration
├── CollabuuApp.swift              # App entry point
├── ContentView.swift              # Main app view
└── Assets.xcassets/               # Images and assets
```

### Architecture Pattern
- **MVVM** (Model-View-ViewModel) architecture
- **SwiftUI** for all UI components
- **Async/Await** for asynchronous operations
- **Published properties** (@Published) for state management
- **@StateObject** for view model lifecycle management
- Reactive data binding using Combine

---

## 2. BUSINESS PROFILE FEATURES

### Campaign Management

#### Campaign Types (paymentType enum)
Located: `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Campaigns/Views/NewCampaign/NewCampaignViewModel.swift`

1. **Pay Per Customer** (`pay_per_customer`)
   - Business pays credits per customer visit
   - Requires: influencer spots, credits per customer, max budget
   - Duration: Date range (startDate to endDate)

2. **Media Event** (`media_event`)
   - Fixed payment for event participation
   - Fixed cost: 300 credits
   - Duration: Single event date/time
   - No influencer spots configured

3. **Rewards/Loyalty** (`rewards`)
   - Engagement-based rewards
   - No direct cost (0 credits)
   - No influencer spots required
   - Date range similar to Pay Per Customer

#### Campaign Creation View
**File**: `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Campaigns/Views/NewCampaign/NewCampaignViewModel.swift`

Key fields in NewCampaignViewModel:
```swift
@Published var title: String
@Published var description: String
@Published var paymentType: BusinessCampaignPaymentType
@Published var requirements: String
@Published var selectedImage: UIImage?
@Published var startDate: Date
@Published var endDate: Date
@Published var isPublic: Bool
@Published var influencerSpots: Int
@Published var creditsPerCustomer: Int        // Pay per customer only
@Published var creditCost: Int                 // Total budget
@Published var eventDateTime: Date             // Media events only
```

Validation rules:
- Title: 3-100 characters
- Description: 20-1000 characters
- Requirements: 10-2000 characters
- Influencer spots: 1-1000 (0 for rewards)
- Credits per customer: 1-1000 (Pay Per Customer only)
- Credit cost: Must be ≥ (influencerSpots × 150) minimum
- Campaign duration: 1-365 days
- Image: Required

#### Campaign Data Model
**File**: `/Users/anthony/Documents/Projects/Collabuu/Shared/Services/APIService.swift` (Line 2313)

```swift
struct Campaign: Codable, Identifiable, Sendable {
    // Core fields
    let id: String
    let businessId: String?
    let title: String
    let subtitle: String?
    let description: String?
    let paymentType: String?              // "pay_per_customer", "media_event", "rewards"
    var status: String                     // "active", "completed", "expired", "draft"
    
    // Dates
    let periodStart: Date?
    let periodEnd: Date?
    
    // Campaign metrics
    let influencerSpots: Int?
    let creditsPerAction: Int?
    let creditsPerCustomer: Int?
    let totalCredits: Int?
    
    // Tracking
    var visitCount: Int?
    var influencerVisitorCount: Int?
    var directAppVisitorCount: Int?
    var totalCreditsTransferred: Double?
    var usedCredits: Int?
    
    // Application tracking
    var influencerCount: Int?              // Accepted applications
    var pendingApplicationsCount: Int?
    
    // Visibility
    let visibility: String?                // "public" or "private"
    let requirements: String?
    
    // Media
    let imageUrl: String?
    let imageURL: String?                  // Alternative field name
    
    // Metadata
    let createdAt: Date?
    let updatedAt: Date?
    let commissionRate: Double?
    let isExpired: Bool?
}
```

#### Campaign Listing & Filtering
**File**: `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Campaigns/ViewModels/BusinessCampaignsViewModel.swift`

Filter options:
```swift
struct BusinessCampaignFilters {
    var searchText: String = ""
    var selectedStatuses: Set<BusinessCampaignStatus> = []
    var selectedPaymentTypes: Set<BusinessCampaignPaymentType> = []
    var sortBy: BusinessCampaignSortOption = .newest
}

enum BusinessCampaignStatus: String {
    case active, completed, expired
}

enum BusinessCampaignPaymentType: String {
    case payPerCustomer, mediaEvent, rewards
}

enum BusinessCampaignSortOption {
    case newest, oldest, visits, endDate
}
```

Performance metrics tracked:
- Total campaigns count
- Active campaigns count
- Customer visits
- Active influencers
- Total collaborations
- Visitor graph data (by time range: 7, 30, 90 days, 1 year)

#### Influencer Approval Workflow
**File**: `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Campaigns/Views/BusinessCampaignDetailView.swift`

Campaign detail view displays:
1. **Content Feed Tab**: User-generated content submissions
2. **Influencers Tab**: 
   - Accepted influencers list
   - Pending applications
   - Influencer profiles with stats
   - Send invitations button
   - Application search/filtering

**Application states**:
- `pending` - Awaiting influencer response
- `accepted` - Influencer joined campaign
- `rejected` - Influencer declined
- `withdrawn` - Influencer withdrew application

---

## 3. STYLING SYSTEM

### Design Tokens

#### Colors
**File**: `/Users/anthony/Documents/Projects/Collabuu/Shared/Styles/AppColors.swift`

```swift
// Primary Brand Colors
AppColors.primary = #EC4899 (Pink)
AppColors.primaryDark = #DB2777
AppColors.primaryLight = #F9A8D4

// User Type Colors
AppColors.influencerColor = #F59E0B (Amber)
AppColors.businessColor = #3B82F6 (Blue)
AppColors.customerColor = #8B5CF6 (Violet)
AppColors.rewardsColor = #EF4444 (Red)

// Neutral Colors
AppColors.textPrimary = #0F172A (Dark blue-gray)
AppColors.textSecondary = #64748B (Medium gray)
AppColors.textTertiary = #94A3B8 (Light gray)
AppColors.background = #FFFFFF
AppColors.backgroundSecondary = #F8FAFC
AppColors.backgroundTertiary = #F1F5F9

// Status Colors
AppColors.success = #10B981 (Green)
AppColors.warning = #F59E0B (Amber)
AppColors.error = #EF4444 (Red)
AppColors.info = #3B82F6 (Blue)

// Border Colors
AppColors.border = #94A3B8
AppColors.borderDark = #64748B
AppColors.borderLight = #CBD5E1
```

#### Typography
**File**: `/Users/anthony/Documents/Projects/Collabuu/Shared/Styles/AppTypography.swift`

Typography scale:
```swift
// Display sizes (36-57pt)
AppTypography.displayLarge = 57pt, regular
AppTypography.displayMedium = 45pt, regular
AppTypography.displaySmall = 36pt, regular

// Headline sizes (24-32pt)
AppTypography.headlineLarge = 32pt, regular
AppTypography.headlineMedium = 28pt, regular
AppTypography.headlineSmall = 24pt, regular

// Title sizes (14-22pt)
AppTypography.titleLarge = 22pt, medium
AppTypography.titleMedium = 16pt, medium
AppTypography.titleSmall = 14pt, medium

// Body sizes (12-16pt)
AppTypography.bodyLarge = 16pt, regular
AppTypography.bodyMedium = 14pt, regular
AppTypography.bodySmall = 12pt, regular

// Button sizes (12-16pt)
AppTypography.buttonLarge = 16pt, semibold
AppTypography.buttonMedium = 14pt, semibold
AppTypography.buttonSmall = 12pt, semibold

// Label sizes (11-14pt)
AppTypography.labelLarge = 14pt, medium
AppTypography.labelMedium = 12pt, medium
AppTypography.labelSmall = 11pt, medium
```

View modifiers available:
```swift
.displayLarge(), .displayMedium(), .displaySmall()
.headlineLarge(), .headlineMedium(), .headlineSmall()
.titleLarge(), .titleMedium(), .titleSmall()
.bodyLarge(), .bodyMedium(), .bodySmall()
.labelLarge(), .labelMedium(), .labelSmall()
.buttonLarge(), .buttonMedium(), .buttonSmall()
```

Each can accept custom color: `.bodyLarge(.red)`

#### Spacing
**File**: `/Users/anthony/Documents/Projects/Collabuu/Shared/Styles/AppSpacing.swift`

```swift
// Base spacing scale
AppSpacing.xs = 4pt       // Extra small
AppSpacing.sm = 8pt       // Small
AppSpacing.md = 16pt      // Medium (base)
AppSpacing.lg = 24pt      // Large
AppSpacing.xl = 32pt      // Extra large
AppSpacing.xxl = 48pt     // 2X large
AppSpacing.xxxl = 64pt    // 3X large

// Component-specific spacing
AppSpacing.cardPadding = 16pt
AppSpacing.screenPadding = 16pt
AppSpacing.sectionSpacing = 24pt
AppSpacing.buttonPaddingHorizontal = 24pt
AppSpacing.buttonPaddingVertical = 16pt

// Corner radius scale
AppSpacing.radiusXS = 4pt
AppSpacing.radiusSM = 8pt
AppSpacing.radiusMD = 12pt
AppSpacing.radiusLG = 16pt
AppSpacing.radiusXL = 24pt
AppSpacing.radiusXXL = 32pt

// Navigation
AppSpacing.tabBarHeight = 80pt
AppSpacing.navigationBarHeight = 44pt

// Icons
AppSpacing.iconSM = 16pt
AppSpacing.iconMD = 20pt
AppSpacing.iconLG = 24pt
AppSpacing.iconXL = 32pt
```

Spacing modifiers:
```swift
.paddingHorizontal(_ value)
.paddingVertical(_ value)
.paddingAll(_ value)
.cornerRadius(_ radius)
```

### Reusable Components

Located: `/Users/anthony/Documents/Projects/Collabuu/Shared/Components/`

Key components:
- **AppButton**: Customizable buttons with multiple styles
  - Styles: primary, secondary, outline, ghost, destructive, userType
  - Sizes: small, medium, large
  - Loading state support
  
- **StandardizedButton**: Button wrapper with predefined styling
- **AppTextField**: Text input with validation
- **CampaignCard**: Campaign preview card
- **CampaignImageView**: Campaign image with loading state
- **HTTP2AsyncImage**: Image loading with HTTP/2 optimization
- **StatCard**: Statistics display card
- **StandardizedListComponents**: List items and sections
- **StandardizedModalComponents**: Modal dialogs
- **StandardizedNavigationComponents**: Navigation headers, back buttons
- **SkeletonLoader**: Placeholder loading states
- **InteractiveAreaChart**: Analytics visualization
- **QRCodeView**: QR code display and generation
- **LinkPreviewView**: Link preview with metadata

---

## 4. DATA MODELS & STRUCTURES

### Campaign-Related Models

#### CampaignApplication Model
**File**: `/Users/anthony/Documents/Projects/Collabuu/Shared/Models/CampaignApplication.swift`

Application states and tracking for influencers applying to campaigns.

#### BusinessProfile Model
```swift
struct BusinessProfile {
    let id: String
    let userId: String
    let businessName: String
    let address: String
    let streetAddress: String?
    let city: String?
    let state: String?
    let postalCode: String?
    let country: String?
    let phone: String
    let email: String
    let availableCredits: Int        // Key for payment system
    let website: String?
    let socialMediaHandles: SocialMediaHandles?
    let imageUrls: [String]
    let isVerified: Bool
    let createdAt: Date
    let updatedAt: Date
}
```

#### CreditPackage Model
**File**: `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Profile/Models/CreditPackage.swift`

```swift
struct CreditPackage: Identifiable, Codable {
    let id: String
    let credits: Int
    let points: Int              // Price in cents
    let pointsPerCredit: Int
    let discount: Int?           // Discount percentage
    let isBestValue: Bool
    
    var displayTitle: String     // "100 Credits"
    var displayPoints: String    // "9900 points"
    var discountText: String?    // "Save 10%"
    var originalPrice: Int?
    var savings: Int?
    var pricePerCredit: Double
}
```

Pre-defined packages:
- 100 credits: $99.00 (0.99/credit)
- 500 credits: $450.00 (0.90/credit, 5% discount)
- 1000 credits: $800.00 (0.80/credit, 10% discount)
- 2500 credits: $1,875.00 (0.75/credit, 15% discount "Best Value")

#### Transaction Status
```swift
enum TransactionStatus: String, Codable {
    case pending, processing, completed, failed, refunded
}
```

### User Models

#### User Model
```swift
struct User: Codable, Sendable {
    let id: String
    let email: String
    let userType: String              // "business", "influencer", "customer"
    let firstName: String?
    let lastName: String?
    let username: String?
    let profileImageUrl: String?
    let bio: String?
    let createdAt: Date
    let updatedAt: Date?
}
```

#### InfluencerProfile Model
```swift
struct InfluencerProfile: Codable, Identifiable, Sendable {
    let id: String
    let userId: String
    let username: String
    let bio: String
    let socialMediaHandles: [String: String]
    let location: String
    let availableCredits: Int
    let followersCount: Int
    let activeCampaigns: Int
    let profileImageUrl: String?
    let isVerified: Bool
    let firstName: String?
    let lastName: String?
    let email: String?
    let influencerType: String?
    let audienceSizeRange: String?
    let createdAt: Date
    let updatedAt: Date
}
```

### Common Models

#### QR Code Models
```swift
struct AppQRCodeData: Codable {
    let campaignId: String
    let influencerId: String
    let customerId: String?
    let timestamp: String
    let signature: String
    let type: QRCodeType          // "influencer", "customer", "unknown"
    let isValid: Bool
}

struct AppScanResult: Identifiable, Codable {
    let id: UUID
    let influencerName: String
    let campaignTitle: String
    let verificationCode: String
    let timestamp: Date
    let isValid: Bool
    let qrCodeType: QRCodeType
    let customerName: String?
    let businessName: String?
    let creditsAmount: Int?
    let loyaltyPointsAmount: Int?
}
```

#### Time Range Models
```swift
enum AppTimeRange: String, CaseIterable {
    case last7Days, last30Days, last90Days, lastYear
    
    var displayName: String
    var startDate: Date      // Computed property for filtering
}
```

---

## 5. API INTEGRATION & BACKEND COMMUNICATION

### API Service
**File**: `/Users/anthony/Documents/Projects/Collabuu/Shared/Services/APIService.swift`

#### Base Configuration
```swift
class APIService: ObservableObject {
    static let shared = APIService()
    
    private var baseURL: String {
        // Uses Railway URL from DevConfigService
        return DevConfigService.shared.baseURL
    }
    
    private var authToken: String?
    @Published var isAuthenticated = false
    @Published var currentUser: User?
}
```

#### Authentication Methods

**Login**:
```swift
func signIn(email: String, password: String, userType: UserType) async throws
```
Endpoint: `POST /{userType}/auth/login`
Body: `{ email, password }`
Returns: AuthResponse with token, user, userType

**Signup**:
```swift
func signUp(email: String, password: String, userType: UserType, 
           additionalData: [String: Any] = [:]) async throws
```
Endpoint: `POST /auth/signup`

**Token Refresh**:
```swift
func refreshToken() async throws
```
Uses Supabase service to automatically refresh tokens

**Sync with Supabase**:
```swift
func syncWithSupabaseAuth(token: String, user: User, userType: UserType)
```
Synchronizes APIService with Supabase authentication

### Business API Endpoints

#### Campaign Management
```swift
// Fetch all business campaigns
func getBusinessCampaigns() async throws -> [Campaign]
GET /api/business/campaigns

// Get single campaign details
func getBusinessCampaignDetails(campaignId: String) async throws -> Campaign
GET /api/business/campaigns/{campaignId}

// Create new campaign
func createCampaign(_ campaign: Campaign) async throws -> Campaign
POST /api/business/campaigns
Body includes: title, description, paymentType, visibility, status, 
               requirements, influencerSpots, periodStart, periodEnd,
               creditsPerAction, totalCredits, imageUrl

// Update campaign
func updateCampaign(campaignId: String, updates: CampaignUpdateRequest) 
    async throws -> Campaign
PUT /api/business/campaigns/{campaignId}

// Change campaign status
func updateCampaignStatus(campaignId: String, status: String) async throws
PUT /api/business/campaigns/{campaignId}/status
```

#### Business Profile
```swift
func getBusinessProfile() async throws -> BusinessProfile
GET /api/business/profile
Returns: { id, businessName, email, availableCredits, ... }

func updateBusinessProfile(_ profile: BusinessProfile) 
    async throws -> BusinessProfile
PUT /api/business/profile
```

#### In-App Purchase Verification
```swift
// Verify purchase and add credits
POST /api/business/verify-iap-purchase
Body: {
    productId: String,
    transactionId: String,
    credits: Int,
    originalTransactionId: String,
    purchaseDate: ISO8601String,
    platform: "ios",
    jwsRepresentation: String,
    appAccountToken: String?
}
Response: { new_balance: Int } or { current_balance: Int }
```

Error responses:
- 200: Successful new purchase
- 409: Transaction already processed (duplicate)
- Other 4xx/5xx: Verification failed

### Network Configuration
- **HTTP/2 forced** (HTTP/3 QUIC disabled due to iOS 18.4 bugs)
- **URLSession** with optimized configuration
- **Retry logic** with exponential backoff
- **Request timeout**: 15 seconds
- **Auth headers**: Bearer token + X-Business-Id (for team members)

---

## 6. CURRENT PAYMENT SYSTEM (IN-APP PURCHASES)

### StoreKit Service
**File**: `/Users/anthony/Documents/Projects/Collabuu/Shared/Services/StoreKitService.swift`

#### Product Configuration
```swift
enum ProductID: String {
    case credits100 = "100credits"          // 100 credits → $0.99
    case credits500 = "500.credits"         // 500 credits → $4.49 (5% off)
    case credits1000 = "1000.credits"       // 1000 credits → $7.99 (10% off)
    case credits2500 = "2500.credits"       // 2500 credits → $18.75 (15% off)
    case credits5000 = "5000.credits"       // 5000 credits → $37.50 (20% off)
}
```

#### Purchase Flow

**1. Load Products**:
```swift
func loadProducts() async {
    // Checks: AppStore.canMakePayments
    // Skips if already loaded
    // Handles App Store review scenarios
    let products = try await Product.products(for: productIDs)
}
```

**2. Initiate Purchase**:
```swift
func purchase(_ product: Product) async throws -> StoreKit.Transaction? {
    let result = try await product.purchase()
    
    switch result {
    case .success(let verification):
        let transaction = try checkVerified(verification)
        try await processPurchase(transaction)
        await transaction.finish()
        return transaction
    
    case .userCancelled:
        throw PurchaseError.userCancelled
    
    case .pending:
        throw PurchaseError.pending
    }
}
```

**3. Process Purchase (Server Verification)**:
```swift
private func processPurchase(_ transaction: StoreKit.Transaction) async throws {
    // Deduplication check using TransactionRegistry actor
    if await transactionRegistry.isProcessed(transaction.originalID) {
        return // Skip duplicate
    }
    
    // Send transaction to backend for verification
    try await sendPurchaseToBackend(transaction: transaction, credits: credits)
}

private func sendPurchaseToBackend(transaction: Transaction, credits: Int) async throws {
    // POST /api/business/verify-iap-purchase
    // Backend validates App Store receipt and adds credits
}
```

**4. Transaction Listener**:
- Monitors for purchases in background
- Handles interrupted purchases
- Ensures all transactions are eventually processed
- Prevents duplicate credit additions via deduplication registry

#### Purchase UI Component
**File**: `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Profile/Views/PurchaseCreditsViewIAP.swift`

Features:
- Displays current credit balance
- Shows available credit packages with pricing
- Product cards with discount badges
- Purchase button with loading state
- Error handling for unavailable purchases
- Handles App Store review scenarios (no products available)

#### Payment Methods (Published but Not Implemented)
```swift
enum PaymentMethod: String {
    case creditCard = "credit_card"
    case paypal = "paypal"
    case applePay = "apple_pay"
}
```
Currently: Only Apple Pay via StoreKit (In-App Purchases)

---

## 7. NAVIGATION STRUCTURE

### Navigation Flow

#### Tab Bar Navigation
**File**: `/Users/anthony/Documents/Projects/Collabuu/Core/Navigation/TabBarConfiguration.swift`

**Business User Tabs**:
1. **Campaigns Tab**: Business campaign management
   - List all campaigns
   - Create new campaign
   - View campaign details
   - Manage influencers & applications

2. **Messages Tab**: Direct messaging with influencers
3. **Profile Tab**: Business profile, credits, settings

**Influencer User Tabs**:
1. **Campaigns/Opportunities Tab**: Browse available campaigns
2. **My Campaigns Tab**: Accepted campaigns
3. **Messages Tab**: Messaging with businesses
4. **Profile Tab**: Influencer profile, credits, settings

**Customer User Tabs**:
1. **Deals Tab**: Available loyalty programs
2. **Favorites Tab**: Saved campaigns
3. **Profile Tab**: Preferences, settings

#### Campaign Detail Navigation
```
Campaigns List
  ↓
Campaign Detail View
  ├─ Content Tab (UGC submissions)
  ├─ Influencers Tab
  │   ├─ Influencer Profile (on tap)
  │   └─ Send Invitations (button)
  └─ Edit Button → Edit Campaign View
```

#### Business Settings Navigation
```
Profile Tab
  ├─ Edit Profile
  ├─ Team Management (for team members)
  ├─ Purchase Credits → PurchaseCreditsViewIAP
  ├─ Credit History
  ├─ Account Settings
  │   ├─ Two-Factor Authentication
  │   ├─ Login History
  │   └─ Security
  ├─ Help & Support
  ├─ Terms of Service
  └─ Privacy Policy
```

### Deep Linking
**File**: `/Users/anthony/Documents/Projects/Collabuu/Shared/Views/MainAppView.swift`

Handles deep links via `onOpenURL` modifier:
- Campaign detail links
- Campaign creation links
- Profile links
- Message links

---

## 8. STATE MANAGEMENT

### ViewModels with @MainActor

All view models use `@MainActor` for thread safety:

**BusinessCampaignsViewModel**:
```swift
@MainActor
class BusinessCampaignsViewModel: ObservableObject {
    @Published var campaigns: [Campaign] = []
    @Published var filters: BusinessCampaignFilters
    @Published var selectedTimeRange: AppTimeRange
    @Published var isLoading: Bool = false
    
    // Performance metrics
    @Published var totalCampaigns: Int
    @Published var activeCampaigns: Int
    @Published var customerVisits: Int
    @Published var collaborations: Int
    @Published var visitorChartData: [VisitorDataPoint]
}
```

**NewCampaignViewModel**:
```swift
@MainActor
class NewCampaignViewModel: ObservableObject {
    // Form fields
    @Published var title: String
    @Published var description: String
    @Published var paymentType: BusinessCampaignPaymentType
    
    // Validation errors
    @Published var titleError: String?
    @Published var imageError: String?
    
    // UI state
    @Published var isLoading: Bool
    @Published var showingError: Bool
    @Published var campaignCreated: Bool
}
```

**PurchaseCreditsViewModel**:
```swift
@MainActor
class PurchaseCreditsViewModel: ObservableObject {
    @Published var currentCredits: Int
    @Published var creditPackages: [CreditPackage]
    @Published var selectedPackage: CreditPackage?
    @Published var isLoading: Bool
    @Published var showingPurchaseSuccess: Bool
}
```

### Global Services (Singletons)

**APIService.shared**:
- Handles all REST API communication
- Manages authentication token
- Provides base URL configuration

**SupabaseService.shared**:
- Manages Supabase authentication
- Session token management
- Automatic token refresh

**StoreKitService.shared**:
- In-App Purchase product loading
- Purchase transaction handling
- Transaction deduplication
- Background transaction listener

**DevConfigService.shared**:
- Configuration management
- Base URL setup
- Environment detection

### Notification Center Integration

```swift
// Campaign updates
NotificationCenter.default.post(
    name: .campaignApplicationStatusChanged,
    userInfo: ["campaignId": id]
)

// Credit purchases
NotificationCenter.default.post(
    name: Notification.Name("CreditsPurchased"),
    userInfo: ["credits": amount, "newBalance": total]
)

// Campaign data updates
NotificationCenter.default.post(
    name: .campaignDataUpdated
)
```

---

## 9. KEY IMPLEMENTATION DETAILS

### Image Handling
- **HTTP2AsyncImage**: Custom async image loader with HTTP/2 optimization
- **ImageURLHelper**: Converts URLs to proxy URLs for security
- **Supabase Storage**: Direct image uploads for campaign images

### Form Validation
- Real-time validation on text change (didSet)
- Computed properties for validation state
- Field-specific error messages
- Form validity check before submission

### Loading & Error States
- Skeleton loaders for placeholders
- ProgressView for loading indicators
- StandardizedAlert for error dialogs
- Retry logic with exponential backoff

### Performance Optimizations
- Lazy loading of view sections
- Memoization of computed values
- Batch queries for application counts
- Cancellation of in-flight requests on unmount
- HTTP/2 only (HTTP/3 disabled)

---

## 10. BACKEND API SPECIFICATION

### Base URL
- Uses Railway deployment
- Configured via DevConfigService
- Format: `https://{railway_domain}/api/`

### Common Request Headers
```
Authorization: Bearer {token}
Content-Type: application/json
X-Business-Id: {businessId}                    // For team members
Accept-Protocol: h2                            // Force HTTP/2
Cache-Control: no-cache
```

### Common Response Format
```json
{
    "success": boolean,
    "data": { ... },
    "error": string | null
}
```

### Error Codes
- 200-299: Success
- 400: Bad Request (validation errors, insufficient credits)
- 401: Unauthorized (invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate transaction)
- 500+: Server Error

---

## 11. TESTING & CONFIGURATION

### Product ID Mapping (StoreKit)
- "100credits" → 100 credits
- "500.credits" → 500 credits
- "1000.credits" → 1000 credits
- "2500.credits" → 2500 credits
- "5000.credits" → 5000 credits

### Debug Configuration
- Extensive logging with emoji prefixes (🌐, 💳, ✅, ❌, etc.)
- Network request/response logging
- API endpoint debugging
- StoreKit transaction logging

### Simulator Considerations
- AppStore.canMakePayments check
- Handles missing products (App Store review scenarios)
- TestFlight detection
- iOS 18.4+ compatibility fixes

---

## SUMMARY

The Collabuu iOS app is a comprehensive multi-user platform built with SwiftUI and MVVM architecture. The business features include sophisticated campaign management with multiple payment models, influencer collaboration workflows, and an In-App Purchase-based credit system. The design system is well-defined with consistent colors, typography, and spacing that can be directly mapped to web CSS. State management is clean with @MainActor thread safety and reactive data binding. The API integration uses modern async/await patterns with proper error handling and HTTP/2 optimization.

For web replication, focus on:
1. Matching the exact color palette and typography scales
2. Implementing the same form validation and error handling logic
3. Replicating the campaign filtering and sorting behavior
4. Maintaining the same navigation hierarchy
5. Using the same API endpoints with proper authentication
6. Replacing StoreKit with Stripe or a custom payment solution
