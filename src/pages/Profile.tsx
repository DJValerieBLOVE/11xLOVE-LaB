import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Edit3, Settings, Zap, Users, Heart, ExternalLink, Copy, Check, BookOpen, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { nip19 } from 'nostr-tools';

const Profile = () => {
  const currentUserData = useCurrentUser();
  const { user, metadata } = currentUserData;
  const [copied, setCopied] = useState(false);

  useSeoMeta({
    title: 'Profile - 11x LOVE LaB',
    description: 'Your personal profile and Big Dreams dashboard.',
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
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Please log in to view your profile.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Use display_name if available (prettier formatted name), fallback to name, then generated name
  const displayName = metadata?.display_name || metadata?.name || genUserName(user.pubkey);
  const handle = metadata?.name; // The @handle/username
  const about = metadata?.about || '';
  const picture = metadata?.picture;
  const banner = metadata?.banner;
  const website = metadata?.website;
  const nip05 = metadata?.nip05;
  const lud16 = metadata?.lud16;
  const npub = nip19.npubEncode(user.pubkey);

  // Sample stats (will come from Nostr queries)
  const stats = {
    following: 234,
    followers: 1847,
    zapsReceived: 125000,
    experimentsCompleted: 3,
    currentStreak: 7,
  };

  const copyNpub = () => {
    navigator.clipboard.writeText(npub);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Banner Section */}
        <div className="relative isolate">
          {/* Banner Image or Gradient */}
          <div className="relative h-48 md:h-64 lg:h-80 w-full overflow-hidden">
            {banner ? (
              <img
                src={banner}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#6600ff] via-[#9900ff] to-[#eb00a8]" />
            )}
            {/* Gradient overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Subtle animated particles effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-300" />
              <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse delay-500" />
              <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white rounded-full animate-pulse delay-700" />
            </div>
          </div>

          {/* Profile Info Overlay */}
          <div className="container px-4">
            <div className="relative -mt-20 md:-mt-24 pb-6">
              {/* Avatar with glow effect */}
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#6600ff] to-[#eb00a8] rounded-full blur opacity-75" />
                  <Avatar className="relative h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl">
                    <AvatarImage src={picture} alt={displayName} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-[#6600ff] to-[#9900ff] text-white">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Online indicator */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-background shadow-lg" />
                </div>

                {/* Name and Actions */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                        {displayName}
                        {nip05 && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            <Check className="h-3 w-3 mr-1" />
                            {nip05}
                          </Badge>
                        )}
                      </h1>
                      {/* Show handle if different from display name */}
                      {handle && handle !== displayName && (
                        <p className="text-sm text-muted-foreground mt-0.5">@{handle}</p>
                      )}
                      <button
                        onClick={copyNpub}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                      >
                        <span className="font-mono">{npub.slice(0, 12)}...{npub.slice(-8)}</span>
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <Link to="/settings">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      <Link to="/edit-profile">
                        <Button size="sm" className="bg-[#6600ff] hover:bg-[#5500dd]">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container px-4 pb-12">
          {/* Bio Section */}
          {about && (
            <div className="mb-6 max-w-3xl">
              <p className="text-base md:text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {about}
              </p>
            </div>
          )}

          {/* Links Row */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-[#6600ff] hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
            {lud16 && (
              <div className="flex items-center gap-1.5 text-sm text-orange-500">
                <Zap className="h-4 w-4" />
                {lud16}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-10">
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-[#6600ff]" />
                <p className="text-2xl md:text-3xl font-bold text-[#6600ff]">{stats.followers.toLocaleString()}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Followers</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Heart className="h-5 w-5 mx-auto mb-2 text-[#eb00a8]" />
                <p className="text-2xl md:text-3xl font-bold text-[#eb00a8]">{stats.following.toLocaleString()}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Following</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Zap className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl md:text-3xl font-bold text-orange-500">{(stats.zapsReceived / 1000).toFixed(0)}k</p>
                <p className="text-xs md:text-sm text-muted-foreground">Sats Received</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-5 w-5 mx-auto mb-2 text-green-600" />
                <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.experimentsCompleted}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Experiments</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 hover:shadow-lg transition-shadow col-span-2 sm:col-span-1">
              <CardContent className="p-4 text-center">
                <span className="text-xl mb-2 block">🔥</span>
                <p className="text-2xl md:text-3xl font-bold text-red-500">{stats.currentStreak}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#6600ff]" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/experiments">
                <Button variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Browse Experiments
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  View Events
                </Button>
              </Link>
              <Link to="/feed">
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Community Feed
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
