import { useState, useEffect } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useBigDreams, useSaveBigDream } from '@/hooks/useBigDreams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EQVisualizer } from '@/components/EQVisualizer';
import { Lock, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DIMENSIONS } from '@/lib/dimensions';
import { useToast } from '@/hooks/useToast';
import { OnboardingModal } from '@/components/OnboardingModal';

const BigDreams = () => {
  const { user } = useCurrentUser();
  const { data: bigDreams = [], isLoading: loadingDreams } = useBigDreams();
  const { mutate: saveBigDream, isPending: savingDream } = useSaveBigDream();
  const { toast } = useToast();
  
  // Local state for editing Big Dreams
  const [editingDimension, setEditingDimension] = useState<number | null>(null);
  const [dreamText, setDreamText] = useState<Record<number, string>>({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  // Check if user needs onboarding (no Big Dreams yet)
  useEffect(() => {
    if (!loadingDreams && user && !hasCheckedOnboarding) {
      setHasCheckedOnboarding(true);
      if (bigDreams.length === 0) {
        setShowOnboarding(true);
      }
    }
  }, [bigDreams, loadingDreams, user, hasCheckedOnboarding]);

  useSeoMeta({
    title: 'Big Dreams - 11x LOVE LaB',
    description: 'Update your vision for each dimension',
  });

  // Sample data (will come from relay)
  const currentStreak = 7;
  const longestStreak = 30;
  const completeDays = 124;

  const upcomingEvents = [
    { title: 'Bitcoin Lightning Workshop', date: 'Tomorrow, 2:00 PM' },
    { title: 'Full Moon Ceremony', date: 'Feb 15, 7:00 PM' },
    { title: 'Community Call', date: 'Feb 20, 6:00 PM' },
  ];

  const courseProgress = [
    { title: 'The 11x LOVE Code', progress: 45, color: 'bg-[#6600ff]' },
    { title: 'Bitcoin Basics', progress: 78, color: 'bg-orange-500' },
  ];

  const accountabilityBuddies = [
    { name: 'Sarah M.', streak: 14, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { name: 'Mike T.', streak: 7, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
  ];

  // Get Big Dream content for a dimension
  const getBigDreamContent = (dimensionId: number): string => {
    if (dreamText[dimensionId] !== undefined) {
      return dreamText[dimensionId];
    }
    const dream = bigDreams.find((bd) => bd.dimensionId === dimensionId);
    return dream?.content || '';
  };

  // Handle Big Dream edit
  const handleEditDream = (dimensionId: number) => {
    setEditingDimension(dimensionId);
    const dream = bigDreams.find((bd) => bd.dimensionId === dimensionId);
    setDreamText({
      ...dreamText,
      [dimensionId]: dream?.content || '',
    });
  };

  // Handle Big Dream save
  const handleSaveDream = (dimensionId: number) => {
    const dimension = DIMENSIONS.find((d) => d.id === dimensionId);
    if (!dimension) return;

    const content = dreamText[dimensionId] || '';
    
    saveBigDream(
      { dimension, content },
      {
        onSuccess: () => {
          toast({
            title: 'Big Dream Saved',
            description: `Your vision for ${dimension.name} has been saved securely.`,
          });
          setEditingDimension(null);
        },
        onError: (error) => {
          toast({
            title: 'Failed to Save',
            description: error instanceof Error ? error.message : 'Unknown error',
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Handle textarea change
  const handleDreamChange = (dimensionId: number, value: string) => {
    setDreamText({
      ...dreamText,
      [dimensionId]: value,
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Login Required</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Mock levels for EQ Visualizer (will come from relay data)
  const eqLevels = {
    1: 85,  // GOD/LOVE
    2: 60,  // Soul
    3: 75,  // Mind
    4: 70,  // Body
    5: 60,  // Romance
    6: 75,  // Family
    7: 90,  // Community
    8: 50,  // Mission
    9: 55,  // Money
    10: 65, // Time
    11: 70, // Environment
  };

  return (
    <Layout>
      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

      <div className="container px-4 py-8">
        <h1 className="mb-2">Big Dreams</h1>
        <p className="text-muted-foreground italic mb-8">
          "The future belongs to those who believe in the beauty of their dreams."
        </p>

        {/* EQ Visualizer - Your Progress Dashboard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Your Divine Masterpiece EQ</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Raise your vibes, rock your dreams — track your progress across all 11 Dimensions
            </p>
          </CardHeader>
          <CardContent>
            <EQVisualizer levels={eqLevels} showLabels />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left/Center */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streak Calendar */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span>{currentStreak} day streak</span>
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="text-purple-600 font-normal">Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-purple-100 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-300 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-700 rounded-sm"></div>
                    </div>
                    <span className="text-purple-600 font-normal">More</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* GitHub-style contribution graph */}
                <div className="space-y-2">
                  {['M', 'W', 'F', 'S'].map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{day}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 52 }).map((_, i) => {
                          const intensity = Math.random();
                          const bgColor = 
                            intensity > 0.75 ? 'bg-purple-700' :
                            intensity > 0.5 ? 'bg-purple-500' :
                            intensity > 0.25 ? 'bg-purple-300' :
                            intensity > 0.1 ? 'bg-purple-100' :
                            'bg-gray-100';
                          return (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-sm ${bgColor}`}
                              title={`Day ${i + 1}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-6 mt-4 text-sm">
                  <span>Year of practice: <span className="font-normal text-[#6600ff]">{completeDays} complete days</span></span>
                  <span>Longest streak: <span className="font-normal text-[#6600ff]">{longestStreak} days</span></span>
                  <span>Current streak: <span className="font-normal text-[#6600ff]">{currentStreak} days</span></span>
                </div>
              </CardContent>
            </Card>

            {/* Daily LOVE Practice */}
            <Card className="bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#6600ff] flex items-center justify-center">
                      <span className="text-white text-2xl">💜</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-normal">Daily LOVE Practice</h3>
                      <p className="text-sm text-muted-foreground">Friday, February 13</p>
                    </div>
                  </div>
                  <Button size="lg">
                    + Start Today's Practice
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Complete your 5V check-in: Vibe, Vision, Value, Villain, Victory
                </p>
              </CardContent>
            </Card>

            {/* My 11 Big Dreams */}
            <div>
              <h2 className="text-xl font-normal mb-4">My 11 Big Dreams</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Update your vision for each dimension — your data is encrypted and private by default
              </p>

              {loadingDreams ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#6600ff]" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {DIMENSIONS.map((dimension) => {
                    const dreamContent = getBigDreamContent(dimension.id);
                    const isEditing = editingDimension === dimension.id;
                    const hasDream = dreamContent.length > 0;

                    return (
                      <Card 
                        key={dimension.id} 
                        className="border-t-4" 
                        style={{ borderTopColor: dimension.color }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <span>{dimension.emoji}</span>
                              <span>{dimension.name}</span>
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {isEditing ? (
                            <>
                              <Textarea
                                value={dreamText[dimension.id] || ''}
                                onChange={(e) => handleDreamChange(dimension.id, e.target.value)}
                                placeholder={`What is your big dream for ${dimension.name.toLowerCase()}?`}
                                className="min-h-[100px] resize-none text-sm"
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingDimension(null);
                                    setDreamText({
                                      ...dreamText,
                                      [dimension.id]: undefined,
                                    });
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveDream(dimension.id)}
                                  disabled={savingDream}
                                >
                                  {savingDream ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    'Save Vision'
                                  )}
                                </Button>
                              </div>
                            </>
                          ) : hasDream ? (
                            <>
                              <p className="text-sm whitespace-pre-wrap">{dreamContent}</p>
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditDream(dimension.id)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground italic">
                                No vision set yet. Click below to add your dream for {dimension.name.toLowerCase()}.
                              </p>
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditDream(dimension.id)}
                                >
                                  + Add Vision
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="font-normal text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                ))}
                <Button variant="link" className="w-full mt-2 text-[#6600ff] p-0">
                  View All Events
                </Button>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseProgress.map((course, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-normal text-sm">{course.title}</p>
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${course.color}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Accountability Buddies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accountability Buddies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {accountabilityBuddies.map((buddy, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={buddy.avatar} alt={buddy.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="font-normal text-sm">{buddy.name}</p>
                      <p className="text-xs text-muted-foreground">🔥 {buddy.streak} day streak</p>
                    </div>
                  </div>
                ))}
                {accountabilityBuddies.length < 3 && (
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    + Find a Buddy
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BigDreams;
