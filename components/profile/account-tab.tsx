'use client';

import { useState } from 'react';
import { Shield, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAccountSettings } from '@/lib/hooks/use-profile';
import { ChangePasswordModal } from './change-password-modal';
import { ChangeEmailModal } from './change-email-modal';

export function AccountTab() {
  const { data: accountSettings } = useAccountSettings();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold">Account Settings</h3>
        </div>
        <p className="text-sm text-gray-500">
          Manage your account security and login credentials
        </p>

        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Email Address</Label>
              <p className="text-sm text-gray-500 mt-1">
                {accountSettings?.email || 'Loading...'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setChangeEmailOpen(true)}
              disabled={!accountSettings}
            >
              <Mail className="h-4 w-4 mr-2" />
              Change Email
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Password</Label>
              <p className="text-sm text-gray-500 mt-1">••••••••••••</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setChangePasswordOpen(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={accountSettings?.twoFactorEnabled || false}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <ChangeEmailModal
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        currentEmail={accountSettings?.email || ''}
      />
    </div>
  );
}
