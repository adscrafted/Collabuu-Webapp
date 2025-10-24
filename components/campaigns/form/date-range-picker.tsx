'use client';

import { format, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  startDateError?: string;
  endDateError?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError,
}: DateRangePickerProps) {
  const duration =
    startDate && endDate ? differenceInDays(endDate, startDate) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground',
                  startDateError && 'border-red-500'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                disabled={(date) => date < today}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {startDateError && (
            <p className="text-sm text-red-500">{startDateError}</p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endDate">
            End Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground',
                  endDateError && 'border-red-500'
                )}
                disabled={!startDate}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                disabled={(date) =>
                  date < today || (startDate ? date <= startDate : false)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {endDateError && <p className="text-sm text-red-500">{endDateError}</p>}
        </div>
      </div>

      {/* Duration Display */}
      {duration !== null && duration >= 0 && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center">
            <svg
              className="mr-2 h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Campaign Duration:{' '}
                <span className="font-bold">
                  {duration} {duration === 1 ? 'day' : 'days'}
                </span>
              </p>
              {duration > 0 && duration < 7 && (
                <p className="mt-1 text-xs text-blue-700">
                  Tip: Campaigns running for at least 7 days tend to get more
                  engagement
                </p>
              )}
              {duration > 90 && (
                <p className="mt-1 text-xs text-blue-700">
                  Long campaign! Consider splitting into multiple shorter campaigns
                  for better results
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
