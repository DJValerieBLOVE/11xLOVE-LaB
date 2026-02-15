/**
 * Moderation Hooks for 11x LOVE LaB
 * 
 * Provides:
 * - Mute users (client-side NIP-51 mute list)
 * - Report posts (to site admin)
 * - Admin actions (remove from group, delete posts)
 */

import { useCallback, useMemo } from 'react';
import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useLabOnlyPublish } from './useLabPublish';
import { LAB_RELAY_URL } from '@/lib/relays';
import type { NostrEvent } from '@nostrify/nostrify';

// Site admin pubkey (you - DJ Valerie)
const SITE_ADMIN_PUBKEY = '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767';

/**
 * Hook to manage muted users
 * Uses NIP-51 kind 10000 (mute list) stored on Railway relay
 */
export function useMutedUsers() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { mutateAsync: publishEvent } = useLabOnlyPublish();

  // Query muted users from Railway relay
  const { data: mutedPubkeys = [], isLoading } = useQuery({
    queryKey: ['muted-users', user?.pubkey],
    queryFn: async () => {
      if (!user) return [];
      
      const labRelay = nostr.relay(LAB_RELAY_URL);
      const events = await labRelay.query([{
        kinds: [10000], // NIP-51 mute list
        authors: [user.pubkey],
        limit: 1,
      }]);

      if (events.length === 0) return [];
      
      // Extract muted pubkeys from p tags
      return events[0].tags
        .filter(([name]) => name === 'p')
        .map(([, pubkey]) => pubkey);
    },
    enabled: !!user,
  });

  // Mute a user
  const muteMutation = useMutation({
    mutationFn: async (pubkey: string) => {
      if (!user) throw new Error('Not logged in');
      
      // Add to current list
      const newList = [...new Set([...mutedPubkeys, pubkey])];
      const tags = newList.map(p => ['p', p]);

      await publishEvent({
        kind: 10000,
        content: '',
        tags,
      });

      return newList;
    },
    onSuccess: (newList) => {
      queryClient.setQueryData(['muted-users', user?.pubkey], newList);
    },
  });

  // Unmute a user
  const unmuteMutation = useMutation({
    mutationFn: async (pubkey: string) => {
      if (!user) throw new Error('Not logged in');
      
      const newList = mutedPubkeys.filter(p => p !== pubkey);
      const tags = newList.map(p => ['p', p]);

      await publishEvent({
        kind: 10000,
        content: '',
        tags,
      });

      return newList;
    },
    onSuccess: (newList) => {
      queryClient.setQueryData(['muted-users', user?.pubkey], newList);
    },
  });

  const isMuted = useCallback(
    (pubkey: string) => mutedPubkeys.includes(pubkey),
    [mutedPubkeys]
  );

  return {
    mutedPubkeys,
    isLoading,
    isMuted,
    mute: muteMutation.mutateAsync,
    unmute: unmuteMutation.mutateAsync,
    isMuting: muteMutation.isPending,
    isUnmuting: unmuteMutation.isPending,
  };
}

/**
 * Hook to report posts to site admin
 * Creates a kind 1984 report event (NIP-56)
 */
export function useReportPost() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useLabOnlyPublish();

  return useMutation({
    mutationFn: async ({ 
      eventId, 
      pubkey, 
      reason,
      reportType = 'other',
    }: { 
      eventId: string; 
      pubkey: string; 
      reason: string;
      reportType?: 'spam' | 'nudity' | 'profanity' | 'illegal' | 'impersonation' | 'other';
    }) => {
      if (!user) throw new Error('Not logged in');

      // Create report event (NIP-56)
      await publishEvent({
        kind: 1984, // Report
        content: reason,
        tags: [
          ['e', eventId, '', 'report'], // The reported event
          ['p', pubkey], // The reported user
          ['p', SITE_ADMIN_PUBKEY], // Notify site admin
          ['l', reportType, '#t'], // Label
          ['t', 'lab-report'], // Tag for LaB-specific reports
        ],
      });
    },
  });
}

/**
 * Hook to check if current user is site admin
 */
export function useIsSiteAdmin() {
  const { user } = useCurrentUser();
  return user?.pubkey === SITE_ADMIN_PUBKEY;
}

/**
 * Hook for site admin to view reports
 */
export function useAdminReports() {
  const { nostr } = useNostr();
  const isSiteAdmin = useIsSiteAdmin();

  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const labRelay = nostr.relay(LAB_RELAY_URL);
      const events = await labRelay.query([{
        kinds: [1984], // Reports
        '#p': [SITE_ADMIN_PUBKEY], // Reports sent to admin
        limit: 100,
      }]);

      return events.map(event => ({
        id: event.id,
        reporter: event.pubkey,
        reportedEvent: event.tags.find(([n]) => n === 'e')?.[1],
        reportedUser: event.tags.find(([n, , , r]) => n === 'p' && r !== undefined)?.[1] || 
                      event.tags.filter(([n]) => n === 'p')[1]?.[1],
        reason: event.content,
        type: event.tags.find(([n]) => n === 'l')?.[1] || 'other',
        createdAt: event.created_at,
      }));
    },
    enabled: isSiteAdmin,
  });
}

/**
 * Hook to check if user is admin of a specific tribe/group
 */
export function useTribeAdmin(groupId: string) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['tribe-admin', groupId, user?.pubkey],
    queryFn: async () => {
      if (!user || !groupId) return { isAdmin: false, isModerator: false };

      const labRelay = nostr.relay(LAB_RELAY_URL);
      
      // Get group metadata (kind 39000 for NIP-29)
      const events = await labRelay.query([{
        kinds: [39000],
        '#d': [groupId],
        limit: 1,
      }]);

      if (events.length === 0) return { isAdmin: false, isModerator: false };

      const groupEvent = events[0];
      
      // Check if user is in admin or mod tags
      const isAdmin = groupEvent.tags.some(
        ([name, pubkey, , role]) => 
          name === 'p' && pubkey === user.pubkey && role === 'admin'
      );
      
      const isModerator = groupEvent.tags.some(
        ([name, pubkey, , role]) => 
          name === 'p' && pubkey === user.pubkey && (role === 'moderator' || role === 'admin')
      );

      return { isAdmin, isModerator };
    },
    enabled: !!user && !!groupId,
  });
}

/**
 * Hook for tribe admins to remove users from a group
 */
export function useRemoveFromTribe() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useLabOnlyPublish();

  return useMutation({
    mutationFn: async ({ 
      groupId, 
      pubkeyToRemove,
      reason,
    }: { 
      groupId: string; 
      pubkeyToRemove: string;
      reason?: string;
    }) => {
      if (!user) throw new Error('Not logged in');

      // Create a kick event (NIP-29 group management)
      await publishEvent({
        kind: 9001, // Group remove-user
        content: reason || '',
        tags: [
          ['h', groupId],
          ['p', pubkeyToRemove],
        ],
      });
    },
  });
}

/**
 * Filter events to exclude muted users
 */
export function useFilterMuted<T extends { pubkey: string }>(events: T[]): T[] {
  const { mutedPubkeys, isLoading } = useMutedUsers();

  return useMemo(() => {
    if (isLoading) return events;
    return events.filter(event => !mutedPubkeys.includes(event.pubkey));
  }, [events, mutedPubkeys, isLoading]);
}
