/**
 * Secure Publishing Hook for 11x LOVE LaB
 * 
 * CRITICAL: This hook ensures LaB data stays on the private Railway relay.
 * Public relays are ONLY used when the user explicitly requests sharing.
 */

import { useNostr } from "@nostrify/react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { useCurrentUser } from "./useCurrentUser";
import { getPublishRelays, LAB_RELAY_URL, shouldPublishToPublic } from "@/lib/relays";

import type { NostrEvent } from "@nostrify/nostrify";

interface PublishOptions {
  /** Whether to share to public Nostr (default: false - stays on LaB relay only) */
  shareToPublic?: boolean;
}

export interface LabPublishParams {
  event: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>;
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
      const canGoPublic = shouldPublishToPublic(t.kind, tags);
      
      // Safety check: if they want public but event type doesn't allow it, warn
      if (wantsPublic && !canGoPublic) {
        console.warn(
          `[LaB Security] Event kind ${t.kind} cannot be shared publicly. Publishing to LaB relay only.`
        );
      }

      const relays = getPublishRelays(t.kind, tags, wantsPublic && canGoPublic);
      
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
export function useLabOnlyPublish(): UseMutationResult<NostrEvent, Error, Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (t: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>) => {
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
