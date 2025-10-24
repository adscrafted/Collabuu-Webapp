'use client';

import { useState } from 'react';
import { MoreVertical, UserPlus, Mail, Loader2, Shield, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useTeamMembers, useRemoveTeamMember, useResendInvitation } from '@/lib/hooks/use-profile';
import { TeamMember, ROLE_DISPLAY_NAMES } from '@/lib/types/profile';
import { InviteTeamMemberModal } from './invite-member-modal';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function TeamMembersTab() {
  const { data: teamMembers, isLoading } = useTeamMembers();
  const removeTeamMemberMutation = useRemoveTeamMember();
  const resendInvitationMutation = useResendInvitation();
  const { toast } = useToast();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const activeMembers = teamMembers?.filter((m) => m.status === 'active') || [];
  const pendingMembers = teamMembers?.filter((m) => m.status === 'pending') || [];

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeTeamMemberMutation.mutateAsync(memberToRemove.id);
      toast({
        title: 'Team member removed',
        description: `${memberToRemove.name} has been removed from your team.`,
      });
      setMemberToRemove(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove team member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = async (memberId: string) => {
    try {
      await resendInvitationMutation.mutateAsync(memberId);
      toast({
        title: 'Invitation resent',
        description: 'The invitation has been resent successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend invitation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-gray-500">
            Manage your team and their permissions
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      </div>

      {/* Active Members */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Active Members ({activeMembers.length})
        </h4>

        <div className="divide-y divide-gray-200 border rounded-lg">
          {activeMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No active team members yet</p>
            </div>
          ) : (
            activeMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <Badge variant={getRoleBadgeVariant(member.role) as any}>
                        {ROLE_DISPLAY_NAMES[member.role]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-2 flex-wrap">
                    {member.permissions.slice(0, 2).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                    {member.permissions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.permissions.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Edit Role & Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setMemberToRemove(member)}
                      >
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingMembers.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Pending Invitations ({pendingMembers.length})
          </h4>

          <div className="divide-y divide-gray-200 border rounded-lg">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-200">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {member.email}
                      </p>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pending
                      </Badge>
                      <Badge variant={getRoleBadgeVariant(member.role) as any}>
                        {ROLE_DISPLAY_NAMES[member.role]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Invited {new Date(member.invitedAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResendInvitation(member.id)}
                    disabled={resendInvitationMutation.isPending}
                  >
                    {resendInvitationMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend
                      </>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setMemberToRemove(member)}
                      >
                        Cancel Invitation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Team Member Modal */}
      <InviteTeamMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {memberToRemove?.status === 'pending'
                ? 'Cancel Invitation?'
                : 'Remove Team Member?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.status === 'pending'
                ? `Are you sure you want to cancel the invitation for ${memberToRemove?.email}? They will not be able to join your team.`
                : `Are you sure you want to remove ${memberToRemove?.name} from your team? They will lose access to your business account immediately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
              disabled={removeTeamMemberMutation.isPending}
            >
              {removeTeamMemberMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : memberToRemove?.status === 'pending' ? (
                'Cancel Invitation'
              ) : (
                'Remove Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
