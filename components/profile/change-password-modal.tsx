'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useChangePassword } from '@/lib/hooks/use-profile';
import {
  changePasswordSchema,
  ChangePasswordFormData,
  calculatePasswordStrength,
} from '@/lib/validation/profile-schema';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const changePasswordMutation = useChangePassword();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = form.watch('newPassword');
  const passwordStrength = newPassword ? calculatePasswordStrength(newPassword) : null;

  const handleSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getStrengthWidth = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'w-1/3';
      case 'medium':
        return 'w-2/3';
      case 'strong':
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  const passwordRequirements = [
    {
      label: 'At least 8 characters',
      met: newPassword.length >= 8,
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(newPassword),
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(newPassword),
    },
    {
      label: 'Contains number',
      met: /[0-9]/.test(newPassword),
    },
    {
      label: 'Contains special character',
      met: /[^a-zA-Z0-9]/.test(newPassword),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new secure password.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Password strength:</span>
                        <span
                          className={cn(
                            'font-medium capitalize',
                            passwordStrength === 'weak' && 'text-red-600',
                            passwordStrength === 'medium' && 'text-amber-600',
                            passwordStrength === 'strong' && 'text-green-600'
                          )}
                        >
                          {passwordStrength}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-300',
                            getStrengthColor(passwordStrength!),
                            getStrengthWidth(passwordStrength!)
                          )}
                        />
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Password Requirements */}
            {newPassword && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={cn(req.met ? 'text-green-700' : 'text-gray-500')}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
