import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Heart, BookText, Bookmark, ClipboardList, Music, Library } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Vault = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'The Vault - 11x LOVE LaB',
    description: 'Your private space for growth, reflection, and learning',
  });

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
                <CardDescription>
                  Please log in to access your Vault.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Sample streak data (will come from relay in Chunk 4)
  const currentStreak = 7;
  const longestStreak = 30;
  const completeDays = 124;

  return (
    <Layout>
      <div className="container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">The Vault</h1>
            <p className="text-muted-foreground">
              Your private space for growth, reflection, and learning
            </p>
          </div>
          <Button variant="outline">
            Export
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="daily-love" className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto mb-6">
            <TabsTrigger value="daily-love" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Heart className="h-4 w-4 mr-2" />
              Daily LOVE
            </TabsTrigger>
            <TabsTrigger value="journal" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <BookText className="h-4 w-4 mr-2" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="assessments" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <ClipboardList className="h-4 w-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="music" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Music className="h-4 w-4 mr-2" />
              Music & Meditations
            </TabsTrigger>
            <TabsTrigger value="library" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Library className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily-love" className="space-y-6">
            {/* Streak Calendar */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span>{currentStreak} day streak</span>
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="text-purple-600 font-medium">Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-purple-100 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-300 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-700 rounded-sm"></div>
                    </div>
                    <span className="text-purple-600 font-medium">More</span>
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
                  <span>Year of practice: <strong>{completeDays} complete days</strong></span>
                  <span>Longest streak: <strong>{longestStreak} days</strong></span>
                  <span>Current streak: <strong>{currentStreak} days</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* Daily LOVE Practice Card */}
            <Card className="bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#6600ff] flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Daily LOVE Practice</h3>
                      <p className="text-sm text-muted-foreground">Friday, February 13</p>
                    </div>
                  </div>
                  <Button size="lg">
                    + Start Today's Practice
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Complete both morning alignment and evening review to maintain your streak.
                </p>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">Recent Entries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No entries yet. Start your first practice!</p>
                  <Button>
                    Begin Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs placeholder */}
          <TabsContent value="journal">
            <Card>
              <CardHeader>
                <CardTitle>Journal</CardTitle>
                <CardDescription>Coming soon!</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle>Bookmarks</CardTitle>
                <CardDescription>Coming soon!</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>Coming soon!</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="music">
            <Card>
              <CardHeader>
                <CardTitle>Music & Meditations</CardTitle>
                <CardDescription>Coming soon!</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>Library</CardTitle>
                <CardDescription>Coming soon!</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Vault;
