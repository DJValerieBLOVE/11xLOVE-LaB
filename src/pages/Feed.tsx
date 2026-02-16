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

import { useState, useEffect, useCallback } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFeedPosts, useTribePosts, useFollowingPosts, useNewPostsCount } from '@/hooks/useFeedPosts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Lock, 
  Image, 
  Smile, 
  Plus, 
  Radio, 
  Users,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedPost } from '@/components/FeedPost';
import { LoginArea } from '@/components/auth/LoginArea';
import { useToast } from '@/hooks/useToast';
import { useLabPublish } from '@/hooks/useLabPublish';

const Feed = () => {
  const { user, metadata } = useCurrentUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('latest');
  const [postContent, setPostContent] = useState('');
  
  // Track displayed posts (frozen) vs new posts available
  const [displayedLatestPosts, setDisplayedLatestPosts] = useState<import('@/hooks/useFeedPosts').FeedPost[]>([]);
  const [displayedTribePosts, setDisplayedTribePosts] = useState<import('@/hooks/useFeedPosts').FeedPost[]>([]);
  const [pendingLatestCount, setPendingLatestCount] = useState(0);
  const [pendingTribesCount, setPendingTribesCount] = useState(0);

  // Real Nostr queries - all use user's configured relays
  const { data: allPosts, isLoading: allLoading, refetch: refetchAll } = useFeedPosts(50);
  const { data: tribePosts, isLoading: tribeLoading, refetch: refetchTribe } = useTribePosts(50);
  const { data: followingPosts, isLoading: followingLoading, refetch: refetchFollowing } = useFollowingPosts(50);
  
  // Check for new posts (for notification badges) - only when we have displayed posts
  const lastSeenLatest = displayedLatestPosts.length > 0 
    ? Math.max(...displayedLatestPosts.map(p => p.event.created_at))
    : Math.floor(Date.now() / 1000);
  const lastSeenTribes = displayedTribePosts.length > 0 
    ? Math.max(...displayedTribePosts.map(p => p.event.created_at))
    : Math.floor(Date.now() / 1000);
    
  const { data: newLatestCount = 0 } = useNewPostsCount(lastSeenLatest, 'latest');
  const { data: newTribesCount = 0 } = useNewPostsCount(lastSeenTribes, 'tribes');
  
  // Update pending counts when new posts are detected
  useEffect(() => {
    if (newLatestCount > 0 && displayedLatestPosts.length > 0) {
      setPendingLatestCount(newLatestCount);
    }
  }, [newLatestCount, displayedLatestPosts.length]);
  
  useEffect(() => {
    if (newTribesCount > 0 && displayedTribePosts.length > 0) {
      setPendingTribesCount(newTribesCount);
    }
  }, [newTribesCount, displayedTribePosts.length]);
  
  // Initialize displayed posts on first load
  useEffect(() => {
    if (followingPosts && followingPosts.length > 0 && displayedLatestPosts.length === 0) {
      setDisplayedLatestPosts(followingPosts);
    }
  }, [followingPosts, displayedLatestPosts.length]);
  
  useEffect(() => {
    if (tribePosts && tribePosts.length > 0 && displayedTribePosts.length === 0) {
      setDisplayedTribePosts(tribePosts);
    }
  }, [tribePosts, displayedTribePosts.length]);
  
  // Handle showing new posts (user clicks the button)
  const handleShowNewPosts = useCallback((tab: 'latest' | 'tribes') => {
    if (tab === 'latest' && followingPosts) {
      setDisplayedLatestPosts(followingPosts);
      setPendingLatestCount(0);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'tribes' && tribePosts) {
      setDisplayedTribePosts(tribePosts);
      setPendingTribesCount(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [followingPosts, tribePosts]);
  
  // Update last seen timestamp when switching to a tab
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // When switching tabs, show any pending new posts
    if (tab === 'latest' && followingPosts) {
      setDisplayedLatestPosts(followingPosts);
      setPendingLatestCount(0);
    } else if (tab === 'tribes' && tribePosts) {
      setDisplayedTribePosts(tribePosts);
      setPendingTribesCount(0);
    }
  }, [followingPosts, tribePosts]);

  // Publishing hook
  const { mutate: publishPost, isPending: isPosting } = useLabPublish();

  useSeoMeta({
    title: 'Feed - 11x LOVE LaB',
    description: 'Your personalized feed with updates from Tribes, accountability buddies, and the community',
  });

  // Get posts for current tab - use displayed (frozen) posts, not live data
  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'latest':
        // Use frozen displayed posts, fall back to live data if not yet initialized
        return { 
          posts: displayedLatestPosts.length > 0 ? displayedLatestPosts : (followingPosts || []), 
          loading: followingLoading && displayedLatestPosts.length === 0,
          pendingCount: pendingLatestCount,
        };
      case 'tribes':
        return { 
          posts: displayedTribePosts.length > 0 ? displayedTribePosts : (tribePosts || []), 
          loading: tribeLoading && displayedTribePosts.length === 0,
          pendingCount: pendingTribesCount,
        };
      case 'buddies':
        return { posts: [], loading: false, pendingCount: 0 };
      default:
        return { 
          posts: displayedLatestPosts.length > 0 ? displayedLatestPosts : (followingPosts || []), 
          loading: followingLoading && displayedLatestPosts.length === 0,
          pendingCount: pendingLatestCount,
        };
    }
  };

  const { posts: currentPosts, loading: currentLoading, pendingCount } = getCurrentPosts();

  // Handle refresh - this fetches new data AND shows it immediately
  const handleRefresh = async () => {
    toast({
      title: 'Refreshing...',
      description: 'Fetching latest posts',
    });
    
    switch (activeTab) {
      case 'latest':
        await refetchFollowing();
        // After refetch, update displayed posts
        if (followingPosts) {
          setDisplayedLatestPosts(followingPosts);
          setPendingLatestCount(0);
        }
        break;
      case 'tribes':
        await refetchTribe();
        if (tribePosts) {
          setDisplayedTribePosts(tribePosts);
          setPendingTribesCount(0);
        }
        break;
      default:
        await refetchAll();
    }
  };

  // Handle posting
  const handlePost = () => {
    if (!postContent.trim() || !user) return;

    publishPost({
      event: {
        kind: 1,
        content: postContent,
        tags: [
          ['t', '11xLOVE'],
        ],
      },
      options: {
        shareToPublic: false, // Default to LaB-only
      },
    }, {
      onSuccess: () => {
        toast({
          title: 'Posted!',
          description: 'Your post has been published to the LaB.',
        });
        setPostContent('');
        refetchAll();
      },
      onError: (error) => {
        toast({
          title: 'Failed to post',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

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

  // Sidebar data
  const myTribes = [
    { name: 'Morning Risers', members: 24, unread: 3 },
    { name: 'Bitcoin Builders', members: 156, unread: 12 },
    { name: 'Meditation Masters', members: 42, unread: 0 },
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
      <div className="py-6">
        {/* Centered header */}
        <div className="max-w-[580px] mx-auto px-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Your Feed</h1>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground">
            Updates from your Tribes, buddies, and the community
          </p>
        </div>

        {/* Grid layout - Primal-style: feed centered, sidebar anchored right */}
        <div className="flex justify-center gap-6 px-4">
          {/* Main Feed Column - centered, narrow like Primal */}
          <div className="w-full max-w-[580px] space-y-3">
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
                        disabled={!postContent.trim() || isPosting}
                        className="bg-[#6600ff] hover:bg-[#5500dd]"
                      >
                        {isPosting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          'Post'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed Tabs: Latest, Tribes, Buddies - with notification badges */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto">
                <TabsTrigger 
                  value="latest" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff] px-4 py-2 relative"
                >
                  Latest
                  {newLatestCount > 0 && activeTab !== 'latest' && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-[#eb00a8] rounded-full px-1">
                      {newLatestCount > 99 ? '99+' : newLatestCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="tribes" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff] gap-1.5 px-4 py-2 relative"
                >
                  <Lock className="h-3 w-3" />
                  Tribes
                  {newTribesCount > 0 && activeTab !== 'tribes' && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-[#eb00a8] rounded-full px-1">
                      {newTribesCount > 99 ? '99+' : newTribesCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="buddies" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff] px-4 py-2"
                >
                  Buddies
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <TabsContent value={activeTab} className="mt-0">
                {/* New Posts Button - Primal style */}
                {pendingCount > 0 && (
                  <div className="sticky top-16 z-10 mt-4 mb-2">
                    <Button
                      onClick={() => handleShowNewPosts(activeTab as 'latest' | 'tribes')}
                      className="w-full bg-[#6600ff] hover:bg-[#5500dd] text-white shadow-lg"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {pendingCount} new post{pendingCount > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
                
                {/* Privacy Notice for Tribes tab */}
                {activeTab === 'tribes' && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg mt-4 mb-2">
                    <Lock className="h-4 w-4 text-[#6600ff]" />
                    <p className="text-sm text-[#6600ff]">
                      These posts are private to your Tribes. Only members can see them.
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {currentLoading && (
                  <div className="space-y-4 mt-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Posts */}
                {!currentLoading && (
                  <div className="space-y-2 mt-4">
                    {currentPosts.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                          <p className="text-muted-foreground">
                            {activeTab === 'latest' 
                              ? 'No posts from people you follow. Follow some creators or check your relay settings.'
                              : activeTab === 'tribes'
                              ? 'No Tribe posts yet. Join a Tribe to see private messages here!'
                              : activeTab === 'buddies'
                              ? 'No posts from accountability buddies yet. Add some buddies to see their updates!'
                              : 'No posts to show.'}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      currentPosts.map((post) => (
                        <Card key={post.event.id} className="hover:shadow-md transition-shadow">
                          <FeedPost
                            event={post.event}
                            authorMetadata={post.author}
                            isPrivate={post.isPrivate}
                            tribeName={post.tribeName}
                            stats={post.stats}
                            userLiked={post.userLiked}
                            userReposted={post.userReposted}
                            userZapped={post.userZapped}
                            onMute={handleMute}
                            onReport={handleReport}
                          />
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - fixed width, hidden on mobile */}
          <div className="hidden xl:block w-[280px] flex-shrink-0 space-y-3">
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
