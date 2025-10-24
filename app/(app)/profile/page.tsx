'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Users, CreditCard, Save, AlertTriangle, Loader2, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BusinessProfileTab } from '@/components/profile/business-profile-tab';
import { AccountTab } from '@/components/profile/account-tab';
import { TeamMembersTab } from '@/components/profile/team-members-tab';
import { BillingTab } from '@/components/profile/billing-tab';
import { useUpdateBusinessProfile } from '@/lib/hooks/use-profile';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const updateProfileMutation = useUpdateBusinessProfile();

  // Get active tab from URL query parameter, default to 'business'
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam && ['business', 'account', 'team', 'billing'].includes(tabParam)
    ? tabParam
    : 'business';

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges && activeTab === 'business') {
      setShowUnsavedWarning(true);
      setPendingTab(value);
    } else {
      // Navigate to the new tab via URL
      router.push(`/profile?tab=${value}`);
      setHasUnsavedChanges(false);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedWarning(false);
    if (pendingTab) {
      router.push(`/profile?tab=${pendingTab}`);
      setPendingTab(null);
    }
  };

  const handleSaveProfile = async (data: any) => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync(data);
      toast({
        title: 'Profile saved',
        description: 'Your business profile has been updated successfully.',
      });
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage your business profile, account settings, and team
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border shadow-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tab Navigation */}
          <div className="border-b px-6">
            <TabsList className="h-auto p-0 bg-transparent border-b-0 gap-8">
              <TabsTrigger
                value="business"
                className={cn(
                  'relative h-14 rounded-none border-b-2 border-transparent px-0 pb-3 pt-3',
                  'hover:border-gray-300 hover:text-gray-700',
                  'data-[state=active]:border-pink-500 data-[state=active]:text-pink-600',
                  'data-[state=active]:shadow-none',
                  'transition-colors'
                )}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Business Profile
              </TabsTrigger>

              <TabsTrigger
                value="account"
                className={cn(
                  'relative h-14 rounded-none border-b-2 border-transparent px-0 pb-3 pt-3',
                  'hover:border-gray-300 hover:text-gray-700',
                  'data-[state=active]:border-pink-500 data-[state=active]:text-pink-600',
                  'data-[state=active]:shadow-none',
                  'transition-colors'
                )}
              >
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>

              <TabsTrigger
                value="team"
                className={cn(
                  'relative h-14 rounded-none border-b-2 border-transparent px-0 pb-3 pt-3',
                  'hover:border-gray-300 hover:text-gray-700',
                  'data-[state=active]:border-pink-500 data-[state=active]:text-pink-600',
                  'data-[state=active]:shadow-none',
                  'transition-colors'
                )}
              >
                <Users className="h-4 w-4 mr-2" />
                Team Members
              </TabsTrigger>

              <TabsTrigger
                value="billing"
                className={cn(
                  'relative h-14 rounded-none border-b-2 border-transparent px-0 pb-3 pt-3',
                  'hover:border-gray-300 hover:text-gray-700',
                  'data-[state=active]:border-pink-500 data-[state=active]:text-pink-600',
                  'data-[state=active]:shadow-none',
                  'transition-colors'
                )}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <TabsContent value="business" className="mt-0">
              <BusinessProfileTab
                onFormChange={setHasUnsavedChanges}
                onSubmit={handleSaveProfile}
              />
            </TabsContent>

            <TabsContent value="account" className="mt-0">
              <AccountTab />
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <TeamMembersTab />
            </TabsContent>

            <TabsContent value="billing" className="mt-0">
              <BillingTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Floating Save Button (only for Business Profile tab) */}
      {activeTab === 'business' && hasUnsavedChanges && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg border p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setHasUnsavedChanges(false)}
                disabled={isSaving}
              >
                Discard
              </Button>
              <Button
                onClick={() => {
                  // Trigger form submission
                  const form = document.querySelector('form');
                  if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your business profile. Are you sure you want
              to leave without saving? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTab(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
