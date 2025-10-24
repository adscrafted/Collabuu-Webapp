# Campaign List Page - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📍 Campaigns                          [+ Create Campaign]  │
│  Manage and track your marketing campaigns                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🔍 [Search campaigns...]  [Status ▼] [Type ▼] [Sort ▼] [⚙️ Filters (2)] │
│                                                               │
│  Active filters: [Status: 2 ×] [Search: summer ×]           │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Showing 1 to 6 of 24 campaigns                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │ [Image]   │  │ [Image]   │  │ [Image]   │              │
│  │  [Active] │  │  [Paused] │  │  [Draft]  │              │
│  │───────────│  │───────────│  │───────────│              │
│  │ 🔵 Pay Per│  │ 🟢 Media  │  │ 🟡 Loyalty│              │
│  │ Summer    │  │ Grand     │  │ VIP       │              │
│  │ Campaign  │  │ Opening   │  │ Rewards   │              │
│  │ Jun 1-30  │  │ Jul 15-16 │  │ Aug 1-31  │              │
│  │ 👥 45 👁️ 234│  │ 👥 12 👁️ 89 │  │ 👥 8 👁️ 45  │              │
│  │ 💳 450/1000│  │ 💳 300/300│  │ 💳 50/500 │              │
│  │ ████░░░░░░│  │ ██████████│  │ █░░░░░░░░░│              │
│  └───────────┘  └───────────┘  └───────────┘              │
│                                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │ [Image]   │  │ [Image]   │  │ [Image]   │              │
│  │ [Complete]│  │[Cancelled]│  │  [Active] │              │
│  └───────────┘  └───────────┘  └───────────┘              │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│           [< Previous] [1] [2] [3] [4] [5] [Next >]        │
└─────────────────────────────────────────────────────────────┘
```

## Campaign Card Anatomy

```
┌─────────────────────────────────┐
│                                 │ ← Campaign Image (48px height)
│         [Image]          [✓]    │   Status badge (top-right)
│                                 │   Expired badge if needed (top-left)
├─────────────────────────────────┤
│ 🔵 Pay Per Customer             │ ← Type Badge (color-coded)
│                                 │
│ Summer Restaurant Campaign      │ ← Title (2-line clamp, 1.125rem)
│ Jun 1 - Jun 30, 2024           │ ← Date Range (0.875rem)
│                                 │
│ 👥 45    👁️ 234    💳 450       │ ← Metrics Row
│                                 │
│ Credits      450 / 1,000        │ ← Credits Label
│ ████████░░░░░░░░░░░░░░          │ ← Progress Bar (color-coded)
└─────────────────────────────────┘
```

## Color Palette

### Campaign Type Badges
```
Pay Per Customer: 🔵 Blue
┌──────────────────────┐
│  Pay Per Customer    │  bg-blue-100, text-blue-700, border-blue-200
└──────────────────────┘

Media Event: 🟢 Green
┌──────────────────────┐
│     Media Event      │  bg-green-100, text-green-700, border-green-200
└──────────────────────┘

Loyalty Reward: 🟡 Amber
┌──────────────────────┐
│   Loyalty Reward     │  bg-amber-100, text-amber-700, border-amber-200
└──────────────────────┘
```

### Status Badges
```
Active: 🟢
┌──────────┐
│  Active  │  bg-green-100, text-green-700
└──────────┘

Paused: 🟡
┌──────────┐
│  Paused  │  bg-amber-100, text-amber-700
└──────────┘

Draft: ⚪
┌──────────┐
│  Draft   │  bg-gray-100, text-gray-700
└──────────┘

Completed: 🔵
┌──────────┐
│Completed │  bg-blue-100, text-blue-700
└──────────┘

Cancelled: 🔴
┌──────────┐
│Cancelled │  bg-red-100, text-red-700
└──────────┘

Expired: 🔴
┌──────────┐
│ Expired  │  bg-red-500, text-white
└──────────┘
```

### Progress Bar Colors
```
0-69% Credits Used: Blue
██████░░░░░░░░░  bg-blue-500

70-89% Credits Used: Amber
████████████░░░  bg-amber-500

90-100% Credits Used: Red
██████████████░  bg-red-500
```

## Filter Panel States

### Collapsed (Default)
```
┌────────────────────────────────────────────────────────────┐
│ 🔍 [Search...] [Status ▼] [Type ▼] [Sort ▼] [⚙️ Filters]  │
└────────────────────────────────────────────────────────────┘
```

### Expanded (With Date Range)
```
┌────────────────────────────────────────────────────────────┐
│ 🔍 [Search...] [Status ▼] [Type ▼] [Sort ▼] [⚙️ Filters (1)]│
├────────────────────────────────────────────────────────────┤
│ ┌─ Advanced Filters ────────────────────────────────────┐ │
│ │ Date Range                               [Clear All]  │ │
│ │ [📅 Jun 1, 2024 - Jun 30, 2024]                      │ │
│ └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Active Filters Display
```
┌────────────────────────────────────────────────────────────┐
│ Active filters: [Status: 2 ×] [Type: PAY_PER_CUSTOMER ×]  │
│                [Search: summer ×] [Date Range ×]           │
└────────────────────────────────────────────────────────────┘
```

## Empty States

### No Campaigns Yet
```
┌─────────────────────────────────────────┐
│                                         │
│              📢                          │
│                                         │
│        No campaigns yet                 │
│                                         │
│  Start your first campaign to connect  │
│  with influencers and grow your        │
│  business.                              │
│                                         │
│    [+ Create Your First Campaign]      │
│                                         │
└─────────────────────────────────────────┘
```

### No Results from Filters
```
┌─────────────────────────────────────────┐
│                                         │
│              🔍                          │
│                                         │
│        No campaigns found               │
│                                         │
│  We couldn't find any campaigns        │
│  matching your filters. Try adjusting  │
│  your search criteria.                  │
│                                         │
│          [Clear Filters]                │
│                                         │
└─────────────────────────────────────────┘
```

## Loading State
```
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │▒▒▒▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒▒▒▒│  ← Skeleton  │
│  │▒▒▒▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒▒▒▒│    Cards     │
│  │▒▒▒░░░░░░░░│  │▒▒▒░░░░░░░░│  │▒▒▒░░░░░░░░│    (shimmer) │
│  │▒▒░░░░░░░░░│  │▒▒░░░░░░░░░│  │▒▒░░░░░░░░░│              │
│  │▒░░░░░░░░░░│  │▒░░░░░░░░░░│  │▒░░░░░░░░░░│              │
│  └───────────┘  └───────────┘  └───────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

### Desktop (>1024px) - 3 Columns
```
[Card] [Card] [Card]
[Card] [Card] [Card]
```

### Tablet (768px-1024px) - 2 Columns
```
[Card] [Card]
[Card] [Card]
[Card] [Card]
```

### Mobile (<768px) - 1 Column
```
[Card]
[Card]
[Card]
```

## Interaction States

### Card Hover Effect
```
Normal:                    Hover:
┌─────────────┐           ┌─────────────┐
│   [Image]   │           │   [Image]   │  ↑ -4px translate
│   Content   │    →      │   Content   │  ⚡ Shadow elevation
└─────────────┘           └─────────────┘  🔍 Image scale 105%
  shadow-sm                  shadow-lg
```

### Button States
```
Primary:    [+ Create Campaign]    bg-pink-500, hover: bg-pink-600
Outline:    [Clear Filters]        border-gray-300, hover: bg-gray-100
Ghost:      [× Remove]             transparent, hover: bg-gray-100
```

## Typography Scale

```
Page Title:       3xl (1.875rem) - font-bold
Page Subtitle:    base (1rem) - text-gray-600
Card Title:       lg (1.125rem) - font-semibold, 2-line clamp
Date Range:       sm (0.875rem) - text-gray-600
Metrics:          sm (0.875rem) - font-medium
Badge Text:       xs (0.75rem) - font-medium
```

## Spacing Guide

```
Page Padding:     space-y-6 (1.5rem vertical gap)
Card Gap:         gap-6 (1.5rem between cards)
Card Padding:     p-5 (1.25rem)
Section Gap:      mb-4 (1rem between sections)
Filter Gap:       gap-3 (0.75rem between filters)
```

## Animations

```
Card Hover:       transition-all duration-200
Progress Bar:     transition-all duration-300
Image Scale:      transition-transform duration-200
Popover:          animate-in/out with fade and zoom
Skeleton:         animate-pulse
```
