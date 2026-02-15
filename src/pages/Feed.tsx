/**
 * Feed Page
 * 
 * Combined feed showing:
 * - All: Everything (public + private from Tribes)
 * - Tribes: Private posts from user's groups only
 * - Buddies: Posts from accountability buddies
 * - Public: Public Nostr posts only
 * 
 * PRIVACY:
 * - Private posts have NO share button
 * - Private posts show a lock badge with tribe name
 * - All posts have zap, react, reply, mute, report
 */

import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Lock, 
  Image, 
  Smile, 
  Plus, 
  Radio, 
  Users,
  Globe,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FeedPost } from '@/components/FeedPost';
import { LoginArea } from '@/components/auth/LoginArea';
import { useToast } from '@/hooks/useToast';
import type { NostrEvent } from '@nostrify/nostrify';

const Feed = () => {
  const { user, metadata } = useCurrentUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [postContent, setPostContent] = useState('');

  useSeoMeta({
    title: 'Feed - 11x LOVE LaB',
    description: 'Your personalized feed with updates from Tribes, accountability buddies, and the community',
  });

  // Mock data - will be replaced with real Nostr queries
  const mockPosts: Array<{
    event: NostrEvent;
    isPrivate: boolean;
    tribeName?: string;
  }> = [
    {
      event: {
        id: '1',
        pubkey: 'a'.repeat(64),
        created_at: Math.floor(Date.now() / 1000) - 7200,
        kind: 1,
        tags: [],
        content: 'Just completed my 30-day morning routine experiment! The compound effect is real. Sharing my learnings with the community later today. 🌅',
        sig: '',
      },
      isPrivate: false,
    },
    {
      event: {
        id: '2',
        pubkey: 'b'.repeat(64),
        created_at: Math.floor(Date.now() / 1000) - 3600,
        kind: 11, // NIP-29 group message
        tags: [['h', 'morning-risers']],
        content: 'Day 5 of waking at 5am! The accountability in this group is amazing. Who else is crushing it today? 💪',
        sig: '',
      },
      isPrivate: true,
      tribeName: 'Morning Risers',
    },
    {
      event: {
        id: '3',
        pubkey: 'c'.repeat(64),
        created_at: Math.floor(Date.now() / 1000) - 1800,
        kind: 1,
        tags: [],
        content: 'Big breakthrough in my Money dimension today. Finally automated my savings and it feels like a weight lifted off my shoulders. Small wins add up! 💰',
        sig: '',
      },
      isPrivate: false,
    },
    {
      event: {
        id: '4',
        pubkey: 'd'.repeat(64),
        created_at: Math.floor(Date.now() / 1000) - 900,
        kind: 11,
        tags: [['h', 'bitcoin-builders']],
        content: 'Just set up my first Lightning node! Thanks to everyone here for the guidance. This community is incredible. ⚡',
        sig: '',
      },
      isPrivate: true,
      tribeName: 'Bitcoin Builders',
    },
  ];

  // Filter posts by tab
  const filteredPosts = mockPosts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'tribes') return post.isPrivate;
    if (activeTab === 'public') return !post.isPrivate;
    if (activeTab === 'buddies') return false; // TODO: Filter by accountability buddies
    return true;
  });

  // Handlers
  const handleMute = (pubkey: string) => {
    toast({
      title: 'User Muted',
      description: 'You will no longer see posts from this user.',
    });
    console.log('Muting:', pubkey);
  };

  const handleReport = (eventId: string, reason: string) => {
    toast({
      title: 'Report Submitted',
      description: 'Thank you for helping keep our community safe.',
    });
    console.log('Reporting:', eventId, reason);
  };

  const handlePost = () => {
    if (!postContent.trim()) return;
    toast({
      title: 'Posted!',
      description: 'Your post has been published.',
    });
    setPostContent('');
  };

  // Sidebar data
  const liveNow = [
    { title: 'Bitcoin Lightning Workshop', host: 'Lightning Labs', type: 'Workshop' },
    { title: 'Nostr Development AMA', host: 'Nostr Dev', type: 'Q&A' },
  ];

  const upcomingEvents = [
    { title: 'Bitcoin Lightning Workshop', date: 'Tomorrow, 2:00 PM' },
    { title: 'Nostr Hackathon Kickoff', date: 'Jan 15, 10:00 AM' },
    { title: 'Office Hours', date: 'Today, 5:00 PM' },
  ];

  const myTribes = [
    { name: 'Morning Risers', members: 24, unread: 3 },
    { name: 'Bitcoin Builders', members: 156, unread: 12 },
    { name: 'Meditation Masters', members: 42, unread: 0 },
  ];

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto text-[#6600ff] mb-4" />
              <h1 className="text-3xl font-bold mb-4">Your Feed</h1>
              <p className="text-muted-foreground mb-6">
                See updates from your Tribes, accountability buddies, and the 11x LOVE community.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Login Required</CardTitle>
                </div>
                <CardDescription>
                  Log in to see your personalized feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginArea className="flex justify-center" />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="mb-2">Your Feed</h1>
        <p className="text-muted-foreground mb-8">
          Updates from your Tribes, buddies, and the community
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Composer */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={metadata?.picture} />
                    <AvatarFallback className="bg-[#6600ff]/10 text-[#6600ff]">ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="What's happening?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[80px] border-0 resize-none focus-visible:ring-0 p-0"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Image className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Smile className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Plus className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                      <Button 
                        size="lg" 
                        onClick={handlePost}
                        disabled={!postContent.trim()}
                        className="bg-[#6600ff] hover:bg-[#5500dd]"
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto flex-wrap">
                <TabsTrigger 
                  value="all" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff] gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="tribes" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff] gap-2"
                >
                  <Users className="h-4 w-4" />
                  Tribes
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {mockPosts.filter(p => p.isPrivate).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="buddies" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff] gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Buddies
                </TabsTrigger>
                <TabsTrigger 
                  value="public" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff] gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Public
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <TabsContent value={activeTab} className="mt-0">
                {/* Privacy Notice for Tribes tab */}
                {activeTab === 'tribes' && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg mt-4 mb-2">
                    <Lock className="h-4 w-4 text-[#6600ff]" />
                    <p className="text-sm text-[#6600ff]">
                      These posts are private to your Tribes. Only members can see them.
                    </p>
                  </div>
                )}

                {/* Posts */}
                <div className="space-y-0 mt-4">
                  {filteredPosts.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                          {activeTab === 'buddies' 
                            ? 'No posts from accountability buddies yet. Add some buddies to see their updates!'
                            : 'No posts to show. Check back later!'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPosts.map((post) => (
                      <Card key={post.event.id} className="hover:shadow-md transition-shadow">
                        <FeedPost
                          event={post.event}
                          isPrivate={post.isPrivate}
                          tribeName={post.tribeName}
                          onMute={handleMute}
                          onReport={handleReport}
                        />
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* My Tribes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-[#6600ff]" />
                  My Tribes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myTribes.map((tribe, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6600ff] to-[#eb00a8] flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tribe.name}</p>
                        <p className="text-xs text-muted-foreground">{tribe.members} members</p>
                      </div>
                    </div>
                    {tribe.unread > 0 && (
                      <Badge className="bg-[#eb00a8]">{tribe.unread}</Badge>
                    )}
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  View All Tribes
                </Button>
              </CardContent>
            </Card>

            {/* Live Now */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Radio className="h-4 w-4 text-red-500" />
                  Live Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {liveNow.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{item.host.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.host}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, i) => (
                  <div key={i}>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    {i < upcomingEvents.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
                <Button variant="link" className="w-full mt-2 text-[#6600ff]">
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;
