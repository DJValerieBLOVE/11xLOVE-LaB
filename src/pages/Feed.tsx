import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Image, Smile, Plus, MessageCircle, Repeat2, Zap, Heart, Share2, MoreHorizontal, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Feed = () => {
  const { user, metadata } = useCurrentUser();

  useSeoMeta({
    title: 'Feed - 11x LOVE LaB',
    description: 'Personalized updates from your courses, communities, and connections',
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
                  Please log in to view your feed.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const samplePosts = [
    {
      id: '1',
      author: 'Alex Luna',
      handle: '@alexluna',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      time: '2h ago',
      content: 'Just completed my 30-day morning routine experiment! The compound effect is real. Sharing my learnings with the community later today.',
      comments: 5,
      reposts: 0,
      zaps: 1200,
      likes: 24,
    },
    {
      id: '2',
      author: 'Jordan Rivera',
      handle: '@jordanr',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
      time: '4h ago',
      content: 'Big breakthrough in my Money area today. Finally automated my savings and it feels like a weight lifted off my shoulders. Small wins add up!',
      comments: 8,
      reposts: 0,
      zaps: 2100,
      likes: 42,
    },
    {
      id: '3',
      author: '11x LOVE LaB',
      handle: '@11xlovelab',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=11x',
      time: '6h ago',
      content: 'New experiment just dropped: "The Prosperity Pyramid" 💜 Understanding how GOD, LOVE, and abundance flow together. Check it out!',
      comments: 12,
      reposts: 3,
      zaps: 3500,
      likes: 67,
    },
  ];

  const liveNow = [
    { title: 'Bitcoin Lightning Workshop', host: 'Lightning Labs', type: 'Workshop' },
    { title: 'Nostr Development AMA', host: 'Nostr Dev', type: 'Q&A' },
  ];

  const upcomingEvents = [
    { title: 'Bitcoin Lightning Workshop', date: 'Tomorrow, 2:00 PM' },
    { title: 'Nostr Hackathon Kickoff', date: 'Jan 15, 10:00 AM' },
    { title: 'Office Hours', date: 'Today, 5:00 PM' },
  ];

  const whoToFollow = [
    { name: 'Satoshi Nakamoto', handle: 'Bitcoin creator', followers: '12,500 followers' },
    { name: 'Nostr Dev', handle: 'Protocol developer', followers: '8,300 followers' },
  ];

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="mb-2">Your Feed</h1>
        <p className="text-muted-foreground mb-8">
          Personalized updates from your courses, communities, and connections
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
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="What's happening?"
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
                      <Button size="lg">
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto">
                <TabsTrigger value="all" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
                  All Posts
                </TabsTrigger>
                <TabsTrigger value="communities" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
                  Communities
                </TabsTrigger>
                <TabsTrigger value="learning" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
                  Learning
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Posts */}
            <div className="space-y-4">
              {samplePosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{post.author}</span>
                            <span className="text-muted-foreground text-sm">{post.handle}</span>
                            <span className="text-muted-foreground text-sm">• {post.time}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>

                        <p className="text-base mb-4 whitespace-pre-wrap">
                          {post.content}
                        </p>

                        {/* Engagement Buttons */}
                        <div className="flex items-center justify-between max-w-md">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#6600ff] gap-2">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500 gap-2">
                            <Repeat2 className="h-4 w-4" />
                            {post.reposts > 0 && <span>{post.reposts}</span>}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 gap-2">
                            <Zap className="h-4 w-4" />
                            <span>{post.zaps.toLocaleString()}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 gap-2">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#6600ff]">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
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

            {/* Who to Follow */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Who to Follow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {whoToFollow.map((person, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">{person.name}</p>
                        <p className="text-xs text-muted-foreground">{person.handle}</p>
                        <p className="text-xs text-muted-foreground">{person.followers}</p>
                      </div>
                    </div>
                    <Button size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;
