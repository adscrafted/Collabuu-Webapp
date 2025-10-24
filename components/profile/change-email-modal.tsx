'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Check } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { useRequestEmailChange, useChangeEmail } from '@/lib/hooks/use-profile';
import {
  requestEmailChangeSchema,
  changeEmailSchema,
  RequestEmailChangeFormData,
  ChangeEmailFormData,
} from '@/lib/validation/profile-schema';
import { useToast } from '@/components/ui/use-toast';

interface ChangeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}

export function ChangeEmailModal({
  open,
  onOpenChange,
  currentEmail,
}: ChangeEmailModalProps) {
  const requestEmailChangeMutation = useRequestEmailChange();
  const changeEmailMutation = useChangeEmail();
  const { toast } = useToast();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [newEmail, setNewEmail] = useState('');

  const requestForm = useForm<RequestEmailChangeFormData>({
    resolver: zodResolver(requestEmailChangeSchema),
    defaultValues: {
      newEmail: '',
    },
  });

  const verifyForm = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
      verificationCode: '',
    },
  });

  const handleRequestChange = async (data: RequestEmailChangeFormData) => {
    try {
      await requestEmailChangeMutation.mutateAsync(data);
      setNewEmail(data.newEmail);
      verifyForm.setValue('newEmail', data.newEmail);
      setStep('verify');
      toast({
        title: 'Verification code sent',
        description: `A verification code has been sent to your current email (${currentEmail}).`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyChange = async (data: ChangeEmailFormData) => {
    try {
      await changeEmailMutation.mutateAsync(data);
      toast({
        title: 'Email changed successfully',
        description: `Your email has been updated to ${data.newEmail}.`,
      });
      requestForm.reset();
      verifyForm.reset();
      setStep('email');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    requestForm.reset();
    verifyForm.reset();
    setStep('email');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
          <DialogDescription>
            {step === 'email'
              ? 'Enter your new email address to receive a verification code.'
              : 'Enter the verification code sent to your current email.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <Form {...requestForm}>
            <form
              onSubmit={requestForm.handleSubmit(handleRequestChange)}
              className="space-y-4"
            >
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Current email</p>
                <p className="font-medium">{currentEmail}</p>
              </div>

              <FormField
                control={requestForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="newemail@example.com"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormDescription>
                      You'll receive a verification code at your current email address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={requestEmailChangeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={requestEmailChangeMutation.isPending}
                >
                  {requestEmailChangeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Code
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...verifyForm}>
            <form
              onSubmit={verifyForm.handleSubmit(handleVerifyChange)}
              className="space-y-4"
            >
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Verification code sent
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Check your inbox at <strong>{currentEmail}</strong> for a 6-digit
                      verification code.
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={verifyForm.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the 6-digit code from your email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('email')}
                    disabled={changeEmailMutation.isPending}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={changeEmailMutation.isPending}>
                    {changeEmailMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Verify & Change
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={() => handleRequestChange({ newEmail })}
                  disabled={requestEmailChangeMutation.isPending}
                >
                  Didn't receive the code? Resend
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
