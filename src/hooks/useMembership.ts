/**
 * useMembership Hook
 * 
 * Returns the current user's membership tier and permissions
 * 
 * For beta: Uses manual whitelist
 * Future: Will check NIP-58 badges from Nostr
 */

import { useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { 
  ADMIN_PUBKEY, 
  MEMBER_WHITELIST, 
  getTierPermissions, 
  getTierInfo,
  type MembershipTier,
  type MembershipPermissions,
} from '@/lib/membership';

export interface UseMembershipResult {
  /** Current membership tier */
  tier: MembershipTier;
  /** Permissions for this tier */
  permissions: MembershipPermissions;
  /** Display info (name, color, icon) */
  tierInfo: { name: string; color: string; icon: string };
  /** Is the user logged in? */
  isLoggedIn: boolean;
  /** Quick permission checks */
  isAdmin: boolean;
  isCreator: boolean;
  isPaidMember: boolean;
  canCreate: boolean;
  canUseVault: boolean;
  canComment: boolean;
}

export function useMembership(): UseMembershipResult {
  const { user } = useCurrentUser();

  const result = useMemo(() => {
    // Not logged in = no tier
    if (!user) {
      return {
        tier: 'free' as MembershipTier,
        permissions: getTierPermissions('free'),
        tierInfo: getTierInfo('free'),
        isLoggedIn: false,
        isAdmin: false,
        isCreator: false,
        isPaidMember: false,
        canCreate: false,
        canUseVault: false,
        canComment: false,
      };
    }

    // Check if admin
    if (user.pubkey === ADMIN_PUBKEY) {
      return {
        tier: 'admin' as MembershipTier,
        permissions: getTierPermissions('admin'),
        tierInfo: getTierInfo('admin'),
        isLoggedIn: true,
        isAdmin: true,
        isCreator: true,
        isPaidMember: true,
        canCreate: true,
        canUseVault: true,
        canComment: true,
      };
    }

    // Check whitelist for tier
    const whitelistedTier = MEMBER_WHITELIST[user.pubkey];
    const tier: MembershipTier = whitelistedTier || 'free';
    const permissions = getTierPermissions(tier);

    return {
      tier,
      permissions,
      tierInfo: getTierInfo(tier),
      isLoggedIn: true,
      isAdmin: tier === 'admin',
      isCreator: tier === 'creator' || tier === 'byok' || tier === 'admin',
      isPaidMember: tier !== 'free',
      canCreate: permissions.canCreate,
      canUseVault: permissions.canUseVault,
      canComment: permissions.canComment,
    };
  }, [user]);

  return result;
}

/**
 * Hook to check if user can create experiments
 */
export function useCanCreate(): boolean {
  const { canCreate } = useMembership();
  return canCreate;
}

/**
 * Hook to check if user can use vault
 */
export function useCanUseVault(): boolean {
  const { canUseVault } = useMembership();
  return canUseVault;
}

/**
 * Hook to check if user can comment/zap
 */
export function useCanComment(): boolean {
  const { canComment } = useMembership();
  return canComment;
}
