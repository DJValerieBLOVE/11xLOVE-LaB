import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfileStats } from '@/hooks/useProfileStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Edit3, Settings, Zap, ExternalLink, Copy, Check, BookOpen, Calendar, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { genUserName } from '@/lib/genUserName';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { nip19 } from 'nostr-tools';

const Profile = () => {
  const currentUserData = useCurrentUser();
  const { user, metadata } = currentUserData;
  const [copied, setCopied] = useState(false);
  
  // Fetch real follower/following stats from Nostr
  const { followers, following, isLoading: statsLoading } = useProfileStats(user?.pubkey);

  useSeoMeta({
    title: 'Profile - 11x LOVE LaB',
    description: 'Your personal profile and dashboard.',
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

  const copyNpub = () => {
    navigator.clipboard.writeText(npub);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Banner */}
        <div className="relative h-32 sm:h-40 md:h-52 lg:h-64 w-full">
          {banner ? (
            <img
              src={banner}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#6600ff] via-[#9900ff] to-[#eb00a8]" />
          )}
        </div>

        {/* Profile Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Avatar Row */}
          <div className="relative -mt-16 sm:-mt-20 mb-4">
            <div className="flex justify-between items-end">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#6600ff] to-[#eb00a8] rounded-full blur opacity-60" />
                <Avatar className="relative h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl">
                  <AvatarImage src={picture} alt={displayName} className="object-cover" />
                  <AvatarFallback className="text-3xl sm:text-4xl bg-gradient-to-br from-[#6600ff] to-[#9900ff] text-white">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pb-2">
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline" size="icon" className="sm:hidden">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/edit-profile">
                  <Button size="sm" className="bg-[#6600ff] hover:bg-[#5500dd]">
                    <Edit3 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Name & Handle */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {displayName}
            </h1>
            {handle && (
              <p className="text-base text-muted-foreground">@{handle}</p>
            )}
          </div>

          {/* Bio */}
          {about && (
            <div className="mb-4">
              <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
                {about}
              </p>
            </div>
          )}

          {/* Links & Verification */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm">
            {nip05 && (
              <div className="flex items-center gap-1.5 text-[#6600ff]">
                <Check className="h-4 w-4" />
                <span>{nip05}</span>
              </div>
            )}
            {website && (
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#6600ff] hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
            {lud16 && (
              <div className="flex items-center gap-1.5 text-orange-500">
                <Zap className="h-4 w-4" />
                {lud16}
              </div>
            )}
          </div>

          {/* Npub */}
          <button
            onClick={copyNpub}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <span className="font-mono text-xs">{npub.slice(0, 16)}...{npub.slice(-8)}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Follower/Following Stats - Like Twitter/Primal */}
          <div className="flex items-center gap-6 mb-8">
            {statsLoading ? (
              <>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground">{following.toLocaleString()}</span>
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground">{followers.toLocaleString()}</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-8" />

          {/* Quick Actions */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#6600ff]" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/big-dreams">
                <Button variant="outline" className="gap-2">
                  <span className="text-lg">✨</span>
                  Big Dreams
                </Button>
              </Link>
              <Link to="/experiments">
                <Button variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Experiments
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </Button>
              </Link>
              <Link to="/feed">
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Feed
                </Button>
              </Link>
            </div>
          </section>

          {/* Activity Stats Cards */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Your Activity</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl sm:text-3xl font-bold text-orange-500">—</p>
                  <p className="text-sm text-muted-foreground">Sats Received</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                <CardContent className="p-4 sm:p-6 text-center">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">—</p>
                  <p className="text-sm text-muted-foreground">Experiments</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 col-span-2 sm:col-span-1">
                <CardContent className="p-4 sm:p-6 text-center">
                  <span className="text-2xl mb-2 block">🔥</span>
                  <p className="text-2xl sm:text-3xl font-bold text-red-500">—</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
