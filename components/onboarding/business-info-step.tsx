'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Building2, Phone, Globe } from 'lucide-react'

interface BusinessInfoStepProps {
  data: any
  setData: (data: any) => void
}

export default function BusinessInfoStep({ data, setData }: BusinessInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Business Information</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your business
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            placeholder="Enter your business name"
            value={data.businessName}
            onChange={(e) => setData({ ...data, businessName: e.target.value })}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            10 digits required (e.g., 5551234567)
          </p>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://yourwebsite.com"
            value={data.website}
            onChange={(e) => setData({ ...data, website: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Optional - We'll add https:// if needed
          </p>
        </div>
      </div>
    </div>
  )
}
