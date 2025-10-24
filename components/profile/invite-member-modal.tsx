'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useInviteTeamMember } from '@/lib/hooks/use-profile';
import {
  inviteTeamMemberSchema,
  InviteTeamMemberFormData,
} from '@/lib/validation/profile-schema';
import { useToast } from '@/components/ui/use-toast';

interface InviteTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteTeamMemberModal({
  open,
  onOpenChange,
}: InviteTeamMemberModalProps) {
  const inviteMutation = useInviteTeamMember();
  const { toast } = useToast();

  const form = useForm<InviteTeamMemberFormData>({
    resolver: zodResolver(inviteTeamMemberSchema),
    defaultValues: {
      email: '',
      role: 'editor',
    },
  });

  const handleSubmit = async (data: InviteTeamMemberFormData) => {
    try {
      await inviteMutation.mutateAsync(data);
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${data.email}.`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team with a specific role.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="teammate@example.com"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Admin</span>
                          <span className="text-xs text-gray-500">
                            Manage campaigns, team members, and business settings
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Editor</span>
                          <span className="text-xs text-gray-500">
                            Create and edit campaigns, view analytics
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={inviteMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
