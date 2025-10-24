# Backend Integration Guide

This document provides comprehensive information about the backend API requirements for the Collabuu web application, including all required endpoints, request/response formats, authentication, and database schema.

## Table of Contents

- [Overview](#overview)
- [Base URL Configuration](#base-url-configuration)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Campaign Endpoints](#campaign-endpoints)
  - [Profile Endpoints](#profile-endpoints)
  - [Credits Endpoints](#credits-endpoints)
- [Request/Response Formats](#requestresponse-formats)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Database Schema](#database-schema)
- [File Upload Configuration](#file-upload-configuration)

## Overview

The Collabuu frontend expects a RESTful API backend that handles:
- User authentication and authorization
- Campaign management (CRUD operations)
- Credit system and transactions
- File uploads (campaign images)

**Technology Stack** (recommended):
- Node.js with Express or Fastify
- PostgreSQL database
- JWT for authentication
- Multer or similar for file uploads
- Redis for caching (optional)

## Base URL Configuration

The API base URL is configured via environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

**Requirements**:
- Must support HTTPS in production
- Must have CORS enabled for frontend domains
- Should have health check endpoint at `/health`

## Authentication

### Authentication Flow

1. **User Registration/Login**: Returns JWT access token and refresh token
2. **Token Storage**: Frontend stores tokens in localStorage
3. **Request Authorization**: Access token sent in `Authorization` header
4. **Token Refresh**: Automatic refresh on 401 response

### Headers

All authenticated requests include:

```http
Authorization: Bearer <access_token>
X-Business-Id: <business_id>
Content-Type: application/json
```

### Token Format

**Access Token** (JWT):
```json
{
  "userId": "user-uuid",
  "businessId": "business-uuid",
  "email": "user@example.com",
  "role": "BUSINESS",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Token Expiration**:
- Access Token: 15 minutes
- Refresh Token: 7 days

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new business account.

**Request Body**:
```json
{
  "email": "business@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "My Restaurant",
  "phoneNumber": "+1234567890",
  "acceptedTerms": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "business@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "BUSINESS",
      "businessProfile": {
        "id": "business-uuid",
        "businessName": "My Restaurant",
        "credits": 0,
        "phoneNumber": "+1234567890"
      },
      "createdAt": "2024-10-22T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Error Responses**:
- 400: Validation error (email already exists, weak password, etc.)
- 422: Invalid input format

---

#### POST /api/auth/login

Authenticate user and return tokens.

**Request Body**:
```json
{
  "email": "business@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "business@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "BUSINESS",
      "businessProfile": {
        "id": "business-uuid",
        "businessName": "My Restaurant",
        "credits": 500,
        "phoneNumber": "+1234567890",
        "description": "A cozy restaurant...",
        "website": "https://myrestaurant.com",
        "address": "123 Main St, City, State 12345"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Error Responses**:
- 401: Invalid credentials
- 404: User not found

---

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

#### GET /api/auth/profile

Get current user profile (requires authentication).

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "business@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "BUSINESS",
    "emailVerified": true,
    "businessProfile": {
      "id": "business-uuid",
      "businessName": "My Restaurant",
      "credits": 500,
      "phoneNumber": "+1234567890",
      "description": "A cozy restaurant...",
      "website": "https://myrestaurant.com",
      "address": "123 Main St, City, State 12345",
      "logo": "https://supabase.co/storage/logos/business-uuid.jpg",
      "category": "Restaurant",
      "socialMedia": {
        "instagram": "https://instagram.com/myrestaurant",
        "facebook": "https://facebook.com/myrestaurant"
      }
    }
  }
}
```

---

#### PATCH /api/auth/profile

Update user profile.

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "businessProfile": {
    "businessName": "Updated Restaurant Name",
    "description": "New description...",
    "phoneNumber": "+1234567890",
    "website": "https://newwebsite.com",
    "address": "456 New St, City, State 12345",
    "category": "Fine Dining"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    // Updated user object
  }
}
```

---

### Campaign Endpoints

#### GET /api/campaigns

Get all campaigns for authenticated business.

**Query Parameters**:
- `status` (string, optional): Filter by status (DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED)
- `type` (string, optional): Filter by type (PAY_PER_CUSTOMER, MEDIA_EVENT, LOYALTY_REWARD)
- `search` (string, optional): Search in title and description
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page
- `sortBy` (string, optional): Sort order (newest, oldest, most_visits, end_date)

**Example Request**:
```
GET /api/campaigns?status=ACTIVE&page=1&limit=20
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "campaign-uuid",
        "businessId": "business-uuid",
        "type": "PAY_PER_CUSTOMER",
        "status": "ACTIVE",
        "title": "Summer Promotion",
        "description": "Visit our restaurant this summer",
        "imageUrl": "https://supabase.co/storage/campaigns/image.jpg",
        "category": "Food & Dining",
        "tags": ["summer", "promotion"],
        "startDate": "2024-06-01T00:00:00Z",
        "endDate": "2024-08-31T23:59:59Z",
        "budget": {
          "creditsPerVisit": 10,
          "maxVisits": 100,
          "totalCredits": 1000
        },
        "requirements": {
          "minFollowerCount": 1000,
          "requiredHashtags": ["#MyRestaurant", "#SummerEats"],
          "locationRequirements": "Must be in San Francisco Bay Area"
        },
        "stats": {
          "participantsCount": 5,
          "visitsCount": 23,
          "creditsSpent": 230
        },
        "createdAt": "2024-05-15T10:00:00Z",
        "updatedAt": "2024-06-01T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

#### GET /api/campaigns/:id

Get single campaign by ID.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "campaign-uuid",
    "businessId": "business-uuid",
    "type": "PAY_PER_CUSTOMER",
    "status": "ACTIVE",
    "title": "Summer Promotion",
    "description": "Visit our restaurant this summer...",
    "imageUrl": "https://supabase.co/storage/campaigns/image.jpg",
    "category": "Food & Dining",
    "tags": ["summer", "promotion"],
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z",
    "budget": {
      "creditsPerVisit": 10,
      "maxVisits": 100,
      "totalCredits": 1000
    },
    "requirements": {
      "minFollowerCount": 1000,
      "requiredHashtags": ["#MyRestaurant", "#SummerEats"]
    },
    "stats": {
      "participantsCount": 5,
      "visitsCount": 23,
      "creditsSpent": 230
    },
    "createdAt": "2024-05-15T10:00:00Z",
    "updatedAt": "2024-06-01T10:00:00Z"
  }
}
```

**Error Responses**:
- 404: Campaign not found
- 403: Forbidden (not campaign owner)

---

#### POST /api/campaigns

Create a new campaign.

**Request Body**:
```json
{
  "type": "PAY_PER_CUSTOMER",
  "title": "Summer Promotion",
  "description": "Visit our restaurant this summer and get exclusive deals",
  "imageUrl": "https://supabase.co/storage/campaigns/image.jpg",
  "category": "Food & Dining",
  "tags": ["summer", "promotion", "restaurant"],
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "budget": {
    "creditsPerVisit": 10,
    "maxVisits": 100,
    "totalCredits": 1000
  },
  "requirements": {
    "minFollowerCount": 1000,
    "requiredHashtags": ["#MyRestaurant", "#SummerEats"],
    "locationRequirements": "Must be in San Francisco Bay Area",
    "ageRestrictions": {
      "min": 21
    }
  },
  "status": "DRAFT"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "new-campaign-uuid",
    // ... full campaign object
  }
}
```

**Error Responses**:
- 400: Validation error
- 402: Insufficient credits

---

#### PATCH /api/campaigns/:id

Update existing campaign.

**Request Body**: Same as create, but all fields optional

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    // Updated campaign object
  }
}
```

---

#### DELETE /api/campaigns/:id

Delete a campaign.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

---

#### PATCH /api/campaigns/:id/status

Update campaign status.

**Request Body**:
```json
{
  "status": "ACTIVE"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    // Updated campaign object
  }
}
```

---

#### POST /api/campaigns/:id/duplicate

Duplicate an existing campaign.

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    // New duplicated campaign with status DRAFT
  }
}
```

---

#### POST /api/campaigns/upload-image

Upload campaign image.

**Request**: `multipart/form-data`
```
image: <file>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "url": "https://supabase.co/storage/v1/object/public/campaign-images/uuid.jpg"
  }
}
```

**File Requirements**:
- Max size: 5MB
- Accepted formats: JPG, PNG, WebP
- Recommended dimensions: 1200x630px

---

### Credits Endpoints

#### GET /api/credits/balance

Get current credit balance.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "balance": 500,
    "currency": "USD"
  }
}
```

---

#### GET /api/credits/transactions

Get transaction history.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `type` (string, optional): PURCHASE, CAMPAIGN_SPEND, REFUND

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction-uuid",
        "type": "PURCHASE",
        "amount": 500,
        "credits": 500,
        "description": "Credit purchase - 500 credits package",
        "status": "COMPLETED",
        "paymentMethod": "Stripe",
        "paymentId": "pi_stripe_payment_id",
        "createdAt": "2024-10-20T10:00:00Z"
      },
      {
        "id": "transaction-uuid-2",
        "type": "CAMPAIGN_SPEND",
        "amount": -10,
        "credits": -10,
        "description": "Campaign visit - Summer Promotion",
        "campaignId": "campaign-uuid",
        "status": "COMPLETED",
        "createdAt": "2024-10-21T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional error details
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required or token invalid |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., email already exists) |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits to perform action |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Example Error Responses

**Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

**Insufficient Credits**:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Not enough credits to create campaign",
    "details": {
      "required": 1000,
      "available": 500
    }
  }
}
```

## Rate Limiting

**Recommendations**:
- General API: 100 requests per minute per user
- Authentication endpoints: 5 requests per minute per IP
- File upload: 10 requests per minute per user

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432
```

## Database Schema

### Required Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'BUSINESS',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### business_profiles
```sql
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  phone_number VARCHAR(20),
  website VARCHAR(255),
  address TEXT,
  logo VARCHAR(500),
  category VARCHAR(100),
  credits INTEGER DEFAULT 0,
  social_media JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### campaigns
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  category VARCHAR(100),
  tags JSONB,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  budget JSONB NOT NULL,
  requirements JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  credits INTEGER NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  campaign_id UUID REFERENCES campaigns(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## File Upload Configuration

### Storage Requirements

**Supabase Storage** (recommended):
- Bucket: `campaign-images`
- Public access: Yes
- Max file size: 5MB
- Allowed types: image/jpeg, image/png, image/webp

### Upload Endpoint

The frontend uploads directly to Supabase, then sends the URL to the backend via `/api/campaigns` or `/api/campaigns/upload-image`.

**Backend responsibility**:
- Validate image URL
- Store URL in database
- Optional: Validate image dimensions and size

---

**Last Updated**: October 2024
