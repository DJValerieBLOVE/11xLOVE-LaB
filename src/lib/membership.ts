/**
 * Membership Tier System
 * 
 * Manages user tiers and permissions for the 11x LOVE LaB
 * 
 * Tiers:
 * - free: Logged in, can view and take experiments (no vault, no comments)
 * - member: $11/mo, has vault, can comment/zap
 * - byok: $11/mo + brings own API key, can create (same as creator)
 * - creator: $33+/mo, can create experiments, events, tribes
 * - admin: Full control
 */

// Admin pubkey (DJ Valerie B LOVE)
export const ADMIN_PUBKEY = '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767';

// Manual whitelist for beta testing
// Format: { pubkey: tier }
// This will be replaced with NIP-58 badge checking later
export const MEMBER_WHITELIST: Record<string, MembershipTier> = {
  // Admin
  [ADMIN_PUBKEY]: 'admin',
  
  // Add beta testers here:
  // 'pubkey123...': 'member',
  // 'pubkey456...': 'creator',
  // 'pubkey789...': 'byok',
};

export type MembershipTier = 'free' | 'member' | 'byok' | 'creator' | 'admin';

export interface MembershipPermissions {
  canView: boolean;
  canTake: boolean;
  canTrackProgress: boolean;
  canUseVault: boolean;
  canComment: boolean;
  canZap: boolean;
  canCreate: boolean;
  canCreateTribes: boolean;
  canCreateEvents: boolean;
  canAdmin: boolean;
}

/**
 * Get permissions for a membership tier
 */
export function getTierPermissions(tier: MembershipTier): MembershipPermissions {
  switch (tier) {
    case 'free':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: false,
        canComment: false,
        canZap: false,
        canCreate: false,
        canCreateTribes: false,
        canCreateEvents: false,
        canAdmin: false,
      };
    
    case 'member':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: true,
        canComment: true,
        canZap: true,
        canCreate: false,
        canCreateTribes: false,
        canCreateEvents: false,
        canAdmin: false,
      };
    
    case 'byok':
    case 'creator':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: true,
        canComment: true,
        canZap: true,
        canCreate: true,
        canCreateTribes: true,
        canCreateEvents: true,
        canAdmin: false,
      };
    
    case 'admin':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: true,
        canComment: true,
        canZap: true,
        canCreate: true,
        canCreateTribes: true,
        canCreateEvents: true,
        canAdmin: true,
      };
    
    default:
      return getTierPermissions('free');
  }
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: MembershipTier): { name: string; color: string; icon: string } {
  switch (tier) {
    case 'free':
      return { name: 'Free', color: 'gray', icon: '👤' };
    case 'member':
      return { name: 'Member', color: 'purple', icon: '💜' };
    case 'byok':
      return { name: 'BYOK Creator', color: 'blue', icon: '🔑' };
    case 'creator':
      return { name: 'Creator', color: 'pink', icon: '✨' };
    case 'admin':
      return { name: 'Admin', color: 'gold', icon: '👑' };
    default:
      return { name: 'Unknown', color: 'gray', icon: '❓' };
  }
}

/**
 * NIP-58 Badge Definitions for 11x LOVE LaB
 * These will be used to check membership via Nostr events
 */
export const BADGE_DEFINITIONS = {
  member: {
    d: '11x-love-lab-member',
    name: '11x LOVE LaB Member',
    description: 'Paid member of the 11x LOVE LaB community',
    image: '/badges/member.png',
  },
  byok: {
    d: '11x-love-lab-byok',
    name: '11x LOVE LaB BYOK',
    description: 'Bring Your Own Key creator in the 11x LOVE LaB',
    image: '/badges/byok.png',
  },
  creator: {
    d: '11x-love-lab-creator',
    name: '11x LOVE LaB Creator',
    description: 'Premium creator in the 11x LOVE LaB community',
    image: '/badges/creator.png',
  },
};
