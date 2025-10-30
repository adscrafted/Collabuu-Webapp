'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import BusinessInfoStep from '@/components/onboarding/business-info-step'
import LocationStep from '@/components/onboarding/location-step'
import SocialMediaStep from '@/components/onboarding/social-media-step'

interface OnboardingData {
  // Step 1: Business Info
  businessName: string
  phone: string
  website: string

  // Step 2: Location
  streetAddress: string
  city: string
  state: string
  postalCode: string
  country: string

  // Step 3: Social Media
  instagram: string
  facebook: string
  twitter: string
  tiktok: string
  youtube: string
  linkedin: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, businessId } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    phone: '',
    website: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Canada',
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    youtube: '',
    linkedin: '',
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Business Info
        return data.businessName.trim() !== '' &&
               data.phone.trim() !== ''
      case 2: // Location
        return data.streetAddress.trim() !== '' &&
               data.city.trim() !== '' &&
               data.state.trim() !== '' &&
               data.postalCode.trim() !== ''
      case 3: // Social Media (optional)
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      // Get Supabase session for authentication
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        toast.error('Authentication error. Please log in again.')
        router.push('/login')
        return
      }

      // Prepare social media handles (only include non-empty values)
      const socialMediaHandles: Record<string, string> = {}
      if (data.instagram) socialMediaHandles.instagram = data.instagram
      if (data.facebook) socialMediaHandles.facebook = data.facebook
      if (data.twitter) socialMediaHandles.twitter = data.twitter
      if (data.tiktok) socialMediaHandles.tiktok = data.tiktok
      if (data.youtube) socialMediaHandles.youtube = data.youtube
      if (data.linkedin) socialMediaHandles.linkedin = data.linkedin

      // Call the PUT /api/business/profile endpoint (same as iOS)
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          businessName: data.businessName,
          address: `${data.streetAddress}, ${data.city}, ${data.state} ${data.postalCode}`,
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone,
          website: data.website || '',
          ...Object.fromEntries(
            Object.entries(socialMediaHandles).map(([key, value]) => [`${key}_handle`, value])
          ),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save profile')
      }

      toast.success('Profile completed successfully!')

      // Send notification that onboarding is completed (similar to iOS)
      localStorage.setItem('onboarding_completed', 'true')

      // Redirect to campaigns dashboard
      router.push('/campaigns')

    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep data={data} setData={setData} />
      case 2:
        return <LocationStep data={data} setData={setData} />
      case 3:
        return <SocialMediaStep data={data} setData={setData} />
      default:
        return null
    }
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription className="mt-2">
              Step {currentStep} of {totalSteps}
            </CardDescription>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex gap-4 pt-6">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="w-full"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="w-full"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={!canProceed() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Completing...' : 'Complete Profile'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
