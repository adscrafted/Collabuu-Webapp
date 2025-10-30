'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

interface LocationStepProps {
  data: any
  setData: (data: any) => void
}

export default function LocationStep({ data, setData }: LocationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Location</h3>
        <p className="text-sm text-muted-foreground">
          Where is your business located?
        </p>
      </div>

      <div className="space-y-4">
        {/* Street Address */}
        <div className="space-y-2">
          <Label htmlFor="streetAddress" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Street Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="streetAddress"
            placeholder="123 Main Street"
            value={data.streetAddress}
            onChange={(e) => setData({ ...data, streetAddress: e.target.value })}
            required
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            placeholder="Toronto"
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
            required
          />
        </div>

        {/* State/Province and Postal Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">
              State/Province <span className="text-destructive">*</span>
            </Label>
            <Input
              id="state"
              placeholder="ON"
              value={data.state}
              onChange={(e) => setData({ ...data, state: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">
              Postal Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postalCode"
              placeholder="M5H 2N2"
              value={data.postalCode}
              onChange={(e) => setData({ ...data, postalCode: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={data.country}
            onChange={(e) => setData({ ...data, country: e.target.value })}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Currently only available in Canada
          </p>
        </div>
      </div>
    </div>
  )
}
