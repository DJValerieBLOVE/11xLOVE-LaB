import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface BigDreams {
  godLove: number;
  mission: number;
  soul: number;
  mind: number;
  body: number;
  romance: number;
  family: number;
  community: number;
  money: number;
  time: number;
  environment: number;
}

export interface ExperimentProgress {
  experimentId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  completed: boolean;
  dimensionsWorked: string[]; // e.g., ['body', 'mind']
  notes?: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastCheckIn?: Date;
}

export interface UserProfile {
  bigDreams: BigDreams;
  experimentProgress: ExperimentProgress[];
  dailyCheckIns: DailyCheckIn[];
  streaks: StreakData;
  lastUpdated: Date;
}

/**
 * Hook to fetch and reconstruct user profile from Nostr relay
 * Uses kind 30078 events with different d-tags for different data types
 */
export function useUserProfile() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['user-profile', user?.pubkey],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;

      try {
        // Query all kind 30078 events for this user
        const events = await nostr.query([
          {
            kinds: [30078],
            authors: [user.pubkey],
            limit: 100, // Should be enough for profile data
          },
        ]);

        // Initialize empty profile
        const profile: UserProfile = {
          bigDreams: {
            godLove: 0,
            mission: 0,
            soul: 0,
            mind: 0,
            body: 0,
            romance: 0,
            family: 0,
            community: 0,
            money: 0,
            time: 0,
            environment: 0,
          },
          experimentProgress: [],
          dailyCheckIns: [],
          streaks: {
            current: 0,
            longest: 0,
          },
          lastUpdated: new Date(),
        };

        let latestTimestamp = 0;

        // Process each event
        for (const event of events) {
          const dTag = event.tags.find(([name]) => name === 'd')?.[1];
          if (!dTag) continue;

          latestTimestamp = Math.max(latestTimestamp, event.created_at);

          try {
            const content = JSON.parse(event.content);

            switch (dTag) {
              case 'big-dreams':
                // Big Dreams are stored as percentages for each dimension
                if (content && typeof content === 'object') {
                  profile.bigDreams = {
                    godLove: content.godLove || content['god-love'] || 0,
                    mission: content.mission || 0,
                    soul: content.soul || 0,
                    mind: content.mind || 0,
                    body: content.body || 0,
                    romance: content.romance || 0,
                    family: content.family || 0,
                    community: content.community || 0,
                    money: content.money || 0,
                    time: content.time || 0,
                    environment: content.environment || 0,
                  };
                }
                break;

              case 'experiment-complete':
                // Experiment completion status
                if (content && content.experimentId) {
                  profile.experimentProgress.push({
                    experimentId: content.experimentId,
                    completed: true,
                    completedAt: new Date(event.created_at * 1000),
                  });
                }
                break;

              case 'daily-checkin':
                // Daily check-ins
                if (content && content.date) {
                  profile.dailyCheckIns.push({
                    date: content.date, // YYYY-MM-DD format
                    completed: content.completed !== false, // Default to true
                    dimensionsWorked: content.dimensionsWorked || content.dimensions || [],
                    notes: content.notes,
                  });
                }
                break;

              case 'streak-current':
                // Current streak data
                if (content && typeof content === 'object') {
                  profile.streaks = {
                    current: content.current || 0,
                    longest: content.longest || content.longestStreak || 0,
                    lastCheckIn: content.lastCheckIn ? new Date(content.lastCheckIn) : undefined,
                  };
                }
                break;

              default:
                // Unknown d-tag, skip
                console.warn('Unknown profile data type:', dTag);
            }
          } catch (parseError) {
            console.error('Failed to parse profile event content:', event.id, parseError);
          }
        }

        profile.lastUpdated = new Date(latestTimestamp * 1000);

        // Sort check-ins by date (most recent first)
        profile.dailyCheckIns.sort((a, b) => b.date.localeCompare(a.date));

        return profile;
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to save/update Big Dreams
 */
export function useSaveBigDreams() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return async (bigDreams: BigDreams) => {
    if (!user?.signer) {
      throw new Error('You must be logged in to save profile data');
    }

    const event = await user.signer.signEvent({
      kind: 30078,
      content: JSON.stringify(bigDreams),
      tags: [
        ['d', 'big-dreams'],
        ['t', 'profile'],
        ['t', 'big-dreams'],
      ],
      created_at: Math.floor(Date.now() / 1000),
    });

    await nostr.event(event);
    return event;
  };
}

/**
 * Hook to save experiment completion
 */
export function useSaveExperimentProgress() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return async (experimentId: string) => {
    if (!user?.signer) {
      throw new Error('You must be logged in to save progress');
    }

    const event = await user.signer.signEvent({
      kind: 30078,
      content: JSON.stringify({
        experimentId,
        completed: true,
        completedAt: new Date().toISOString(),
      }),
      tags: [
        ['d', 'experiment-complete'],
        ['t', 'progress'],
        ['t', `experiment-${experimentId}`],
      ],
      created_at: Math.floor(Date.now() / 1000),
    });

    await nostr.event(event);
    return event;
  };
}

/**
 * Hook to save daily check-in
 */
export function useSaveDailyCheckIn() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return async (checkIn: Omit<DailyCheckIn, 'completed'>) => {
    if (!user?.signer) {
      throw new Error('You must be logged in to save check-ins');
    }

    const event = await user.signer.signEvent({
      kind: 30078,
      content: JSON.stringify({
        ...checkIn,
        completed: true,
      }),
      tags: [
        ['d', 'daily-checkin'],
        ['t', 'checkin'],
        ['t', `date-${checkIn.date}`],
      ],
      created_at: Math.floor(Date.now() / 1000),
    });

    await nostr.event(event);
    return event;
  };
}

/**
 * Hook to save/update streak data
 */
export function useSaveStreakData() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return async (streaks: StreakData) => {
    if (!user?.signer) {
      throw new Error('You must be logged in to save streak data');
    }

    const event = await user.signer.signEvent({
      kind: 30078,
      content: JSON.stringify({
        current: streaks.current,
        longest: streaks.longest,
        lastCheckIn: streaks.lastCheckIn?.toISOString(),
      }),
      tags: [
        ['d', 'streak-current'],
        ['t', 'streak'],
      ],
      created_at: Math.floor(Date.now() / 1000),
    });

    await nostr.event(event);
    return event;
  };
}