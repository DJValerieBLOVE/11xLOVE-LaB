/**
 * useExperimentJournal Hook
 * 
 * Manages the user's experiment journal (Obsidian-style growing document)
 * Uses Nostr kind 30023 (long-form article) for each experiment
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Experiment } from '@/types/experiment';

export interface JournalEntry {
  lessonId: string;
  lessonTitle: string;
  timestamp: string;
  content: string;
}

export interface ExperimentJournal {
  experimentId: string;
  experimentTitle: string;
  entries: JournalEntry[];
  rawContent: string;
}

/**
 * Fetch and parse the user's journal for a specific experiment
 */
export function useExperimentJournal(experiment: Experiment) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['experiment-journal', experiment.id, user?.pubkey],
    queryFn: async () => {
      if (!user) return null;

      // Query the journal event (kind 30023, addressable)
      const events = await nostr.query([
        {
          kinds: [30023],
          authors: [user.pubkey],
          '#d': [`journal-${experiment.id}`],
          limit: 1,
        },
      ]);

      if (events.length === 0) {
        // No journal yet - return empty structure
        return {
          experimentId: experiment.id,
          experimentTitle: experiment.title,
          entries: [],
          rawContent: '',
        };
      }

      const event = events[0];
      
      // Parse the markdown content to extract entries
      const entries = parseJournalEntries(event.content);

      return {
        experimentId: experiment.id,
        experimentTitle: experiment.title,
        entries,
        rawContent: event.content,
      };
    },
    enabled: !!user,
  });
}

/**
 * Parse markdown journal content into structured entries
 */
function parseJournalEntries(content: string): JournalEntry[] {
  const entries: JournalEntry[] = [];
  
  // Split by lesson headers (## Lesson: ...)
  const sections = content.split(/^## /m);
  
  sections.forEach((section) => {
    if (!section.trim()) return;
    
    // Extract lesson title and timestamp
    const lines = section.split('\n');
    const headerMatch = lines[0].match(/Lesson: (.+?) - (.+)/);
    
    if (headerMatch) {
      const [, lessonTitle, timestamp] = headerMatch;
      const entryContent = lines.slice(1).join('\n').trim();
      
      entries.push({
        lessonId: '', // We don't store lesson ID in markdown (could add metadata)
        lessonTitle,
        timestamp,
        content: entryContent,
      });
    }
  });
  
  return entries;
}

/**
 * Save or update the journal with a new entry
 */
export function useSaveJournalEntry(experiment: Experiment) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      lessonTitle,
      content,
    }: {
      lessonId: string;
      lessonTitle: string;
      content: string;
    }) => {
      if (!user?.signer) {
        throw new Error('You must be logged in to save journal entries');
      }

      // Get existing journal
      const existingEvents = await nostr.query([
        {
          kinds: [30023],
          authors: [user.pubkey],
          '#d': [`journal-${experiment.id}`],
          limit: 1,
        },
      ]);

      const existingContent = existingEvents[0]?.content || `# ${experiment.title} - My Journey\n\n`;
      
      // Append new entry
      const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const newEntry = `## Lesson: ${lessonTitle} - ${timestamp}\n\n${content}\n\n`;
      const updatedContent = existingContent + newEntry;

      // Publish updated journal (kind 30023)
      const tags = [
        ['d', `journal-${experiment.id}`], // Addressable identifier
        ['title', `${experiment.title} - My Journey`],
        ['t', 'journal'],
        ['t', 'experiment'],
        ['t', `experiment-${experiment.id}`],
      ];

      // Add client tag if on HTTPS
      if (location.protocol === 'https:') {
        tags.push(['client', location.hostname]);
      }

      const event = await user.signer.signEvent({
        kind: 30023,
        content: updatedContent,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      // Publish with timeout (5 seconds)
      await nostr.event(event, { signal: AbortSignal.timeout(5000) });

      return event;
    },
    onSuccess: (data) => {
      console.log('Journal entry saved successfully:', data.id);
      // Invalidate journal query to refetch
      queryClient.invalidateQueries({
        queryKey: ['experiment-journal', experiment.id, user?.pubkey],
      });
    },
    onError: (error) => {
      console.error('Failed to save journal entry:', error);
    },
  });
}
