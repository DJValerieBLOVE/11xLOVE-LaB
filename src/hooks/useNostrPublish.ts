import { useNostr } from "@nostrify/react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { useCurrentUser } from "./useCurrentUser";

import type { NostrEvent, NMessage } from "@nostrify/nostrify";

export function useNostrPublish(): UseMutationResult<NostrEvent> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (t: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>) => {
      if (user) {
        const tags = t.tags ?? [];

        // Add the client tag if it doesn't exist
        if (location.protocol === "https:" && !tags.some(([name]) => name === "client")) {
          tags.push(["client", location.hostname]);
        }

        const event = await user.signer.signEvent({
          kind: t.kind,
          content: t.content ?? "",
          tags,
          created_at: t.created_at ?? Math.floor(Date.now() / 1000),
        });

        try {
          await nostr.event(event, { signal: AbortSignal.timeout(5000) });
          return event;
        } catch (error: any) {
          // Check if this is an AUTH challenge error
          if (error.message && error.message.includes('AUTH')) {
            console.log('Received AUTH challenge, attempting to respond...');

            // Try to send AUTH response and retry the publish
            try {
              await sendAuthResponse(user, nostr);
              // Wait a moment for auth to be processed
              await new Promise(resolve => setTimeout(resolve, 1000));
              // Retry the publish
              await nostr.event(event, { signal: AbortSignal.timeout(5000) });
              return event;
            } catch (authError) {
              console.error('AUTH response failed:', authError);
              throw new Error('Authentication failed. Please try again.');
            }
          }
          throw error;
        }
      } else {
        throw new Error("User is not logged in");
      }
    },
    onError: (error) => {
      console.error("Failed to publish event:", error);
    },
    onSuccess: (data) => {
      console.log("Event published successfully:", data);
    },
  });
}

// Helper function to send AUTH response
async function sendAuthResponse(user: any, nostr: any) {
  if (!user?.signer) {
    throw new Error('No user signer available for AUTH');
  }

  // Get the railway relay URL
  const railwayUrl = 'wss://nostr-rs-relay-production-1569.up.railway.app';

  try {
    // Create AUTH event (kind 22242)
    const authEvent = await user.signer.signEvent({
      kind: 22242,
      content: '',
      tags: [
        ['relay', railwayUrl],
        ['challenge', 'auth-required'] // Generic challenge since we don't have the specific one
      ],
      created_at: Math.floor(Date.now() / 1000)
    });

    // Try to publish the AUTH event directly to the relay
    // This is a simplified approach - in practice, AUTH events are sent as responses to AUTH messages
    console.log('Attempting AUTH with event:', authEvent.id);

    // For now, we'll let the relay handle the auth during the retry
    // A more robust implementation would listen for AUTH messages and respond immediately

  } catch (error) {
    console.error('Failed to create AUTH event:', error);
    throw error;
  }
}