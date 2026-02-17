/**
 * Secure Publishing Hook for 11x LOVE LaB
 * 
 * CRITICAL: This hook ensures LaB data stays on the private Railway relay.
 * Public relays are ONLY used when the user explicitly requests sharing.
 * 
 * PRIVACY LEVELS:
 * 🔴 NEVER SHAREABLE - Tribe messages (blocked completely, no share button)
 * 🟡 PRIVATE BY DEFAULT - Big Dreams, Journals (warning dialog before share)
 * 🟢 SHAREABLE - Completions, Feed posts (share with optional confirmation)
 */

import { useNostr } from "@nostrify/react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { useCurrentUser } from "./useCurrentUser";
import { 
  getPublishRelays, 
  LAB_RELAY_URL, 
  shouldPublishToPublic,
  canEverBeShared,
  NEVER_SHAREABLE_KINDS,
} from "@/lib/relays";

import type { NostrEvent } from "@nostrify/nostrify";

interface PublishOptions {
  /** Whether to share to public Nostr (default: false - stays on LaB relay only) */
  shareToPublic?: boolean;
}

/** Partial event for publishing — only kind is required; created_at defaults to now */
type PartialEvent = Omit<NostrEvent, 'id' | 'pubkey' | 'sig' | 'created_at'> & { created_at?: number };

export interface LabPublishParams {
  event: PartialEvent;
  options?: PublishOptions;
}

/**
 * Secure publishing hook that routes events correctly:
 * - LaB data (experiments, progress, journals) → Railway relay ONLY
 * - Public shares (user opted in) → Railway + public relays
 */
export function useLabPublish(): UseMutationResult<NostrEvent, Error, LabPublishParams> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ event: t, options = {} }: LabPublishParams) => {
      if (!user) {
        throw new Error("User is not logged in");
      }

      const tags = t.tags ?? [];

      // Add the client tag if it doesn't exist
      if (location.protocol === "https:" && !tags.some(([name]) => name === "client")) {
        tags.push(["client", location.hostname]);
      }

      // Sign the event
      const event = await user.signer.signEvent({
        kind: t.kind,
        content: t.content ?? "",
        tags,
        created_at: t.created_at ?? Math.floor(Date.now() / 1000),
      });

      // Determine where to publish
      const wantsPublic = options.shareToPublic ?? false;
      const canShare = canEverBeShared(t.kind, tags);
      const canGoPublic = shouldPublishToPublic(t.kind, tags);
      
      // 🔴 HARD BLOCK: Tribe messages can NEVER be shared
      if (wantsPublic && NEVER_SHAREABLE_KINDS.includes(t.kind)) {
        console.error(
          `[LaB Security] 🔴 BLOCKED: Kind ${t.kind} (Tribe message) can NEVER be shared publicly.`
        );
        // Still save to LaB relay, just don't publish to public
      }
      
      // 🟡 SOFT BLOCK: Private content with warning
      if (wantsPublic && !canGoPublic && canShare) {
        console.warn(
          `[LaB Security] 🟡 Event kind ${t.kind} is private by default. User confirmed share.`
        );
      }

      const relays = getPublishRelays(t.kind, tags, wantsPublic && canGoPublic && canShare);
      
      console.log(`[LaB Publish] Publishing kind ${t.kind} to:`, relays);

      // Publish to the appropriate relays using relay groups
      const relayGroup = nostr.group(relays);
      await relayGroup.event(event, { signal: AbortSignal.timeout(5000) });
      
      return event;
    },
    onError: (error) => {
      console.error("[LaB Publish] Failed:", error);
    },
    onSuccess: (data) => {
      console.log("[LaB Publish] Success:", data);
    },
  });
}

/**
 * Hook specifically for LaB-only data (never goes public)
 * Use this for experiments, progress, journals, Big Dreams, etc.
 */
export function useLabOnlyPublish(): UseMutationResult<NostrEvent, Error, PartialEvent> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (t: PartialEvent) => {
      if (!user) {
        throw new Error("User is not logged in");
      }

      const tags = t.tags ?? [];

      // Add the client tag
      if (location.protocol === "https:" && !tags.some(([name]) => name === "client")) {
        tags.push(["client", location.hostname]);
      }

      // Sign the event
      const event = await user.signer.signEvent({
        kind: t.kind,
        content: t.content ?? "",
        tags,
        created_at: t.created_at ?? Math.floor(Date.now() / 1000),
      });

      // ONLY publish to LaB relay - never public
      const labRelay = nostr.relay(LAB_RELAY_URL);
      await labRelay.event(event, { signal: AbortSignal.timeout(5000) });
      
      console.log(`[LaB Only] Published kind ${t.kind} to Railway relay only`);
      
      return event;
    },
    onError: (error) => {
      console.error("[LaB Only Publish] Failed:", error);
    },
    onSuccess: (data) => {
      console.log("[LaB Only Publish] Success:", data);
    },
  });
}

/**
 * Hook for sharing completions to public Nostr
 * Creates a kind 1 note announcing the completion
 */
export function useShareCompletion(): UseMutationResult<NostrEvent, Error, {
  experimentTitle: string;
  lessonTitle?: string;
  message?: string;
}> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ experimentTitle, lessonTitle, message }) => {
      if (!user) {
        throw new Error("User is not logged in");
      }

      // Create a public share message
      const defaultMessage = lessonTitle 
        ? `🎉 Just completed "${lessonTitle}" in the ${experimentTitle} experiment on 11x LOVE LaB! #11xLOVE #nostr`
        : `🎉 Just completed the ${experimentTitle} experiment on 11x LOVE LaB! #11xLOVE #nostr`;
      
      const content = message || defaultMessage;

      const tags: string[][] = [
        ["t", "11xLOVE"],
        ["t", "experiment-completion"],
        ["client", location.hostname],
      ];

      // Sign the event
      const event = await user.signer.signEvent({
        kind: 1, // Regular note - CAN go public
        content,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      // This CAN go to public relays since it's kind 1 without private tags
      const relays = getPublishRelays(1, tags, true);
      const relayGroup = nostr.group(relays);
      await relayGroup.event(event, { signal: AbortSignal.timeout(5000) });
      
      console.log("[Share Completion] Published to public Nostr:", relays);
      
      return event;
    },
  });
}
