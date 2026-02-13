import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, MessageCircle, PartyPopper, Heart, UserPlus, Users as UsersIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Tribe = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Tribe - 11x LOVE LaB',
    description: 'Connect with your private community of like-minded souls.',
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
                  Please log in to access the Tribe community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="mb-2">11x LOVE Tribe</h1>
        <p className="text-muted-foreground mb-8">
          Your private community of souls on the transformation journey
        </p>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto mb-6">
            <TabsTrigger value="chat" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="celebrations" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <PartyPopper className="h-4 w-4 mr-2" />
              Celebrate Wins
            </TabsTrigger>
            <TabsTrigger value="prayer" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Heart className="h-4 w-4 mr-2" />
              Prayer Requests
            </TabsTrigger>
            <TabsTrigger value="find-buddy" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <UserPlus className="h-4 w-4 mr-2" />
              Find Buddy
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <UsersIcon className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Tribe Chat</CardTitle>
                <CardDescription>
                  Coming soon in Chunk 5! NIP-29 group chat will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect with your fellow Tribe members in real-time.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="celebrations">
            <Card>
              <CardHeader>
                <CardTitle>Celebrate Your Wins</CardTitle>
                <CardDescription>
                  Share your victories and celebrate with the community!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Post your wins, breakthroughs, and milestones here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prayer">
            <Card>
              <CardHeader>
                <CardTitle>Prayer Requests</CardTitle>
                <CardDescription>
                  Request support and pray for others in the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share your prayer requests and support fellow members.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="find-buddy">
            <Card>
              <CardHeader>
                <CardTitle>Find an Accountability Buddy</CardTitle>
                <CardDescription>
                  Connect with someone to support your journey (max 3 buddies)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Matching interface coming soon! Browse profiles and connect with buddies.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle>My Groups & Suggested Groups</CardTitle>
                <CardDescription>
                  Join topic-specific groups within the Tribe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover and join sub-groups based on your interests.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tribe;
