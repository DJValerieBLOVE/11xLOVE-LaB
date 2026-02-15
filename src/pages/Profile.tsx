import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useZapStats } from '@/hooks/useZapStats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Edit3, Settings, Zap, ExternalLink, Copy, Check, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FollowListModal } from '@/components/FollowListModal';
import { genUserName } from '@/lib/genUserName';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { nip19 } from 'nostr-tools';

const Profile = () => {
  const currentUserData = useCurrentUser();
  const { user, metadata } = currentUserData;
  const [copied, setCopied] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('following');
  
  // Fetch real stats from Nostr
  const { followers, following, isLoading: statsLoading } = useProfileStats(user?.pubkey);
  const { zapsReceived, isLoading: zapsLoading } = useZapStats(user?.pubkey);

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
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold">Login Required</h2>
                </div>
                <p className="text-muted-foreground">Please log in to view your profile.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Use display_name if available, fallback to name, then generated name
  const displayName = metadata?.display_name || metadata?.name || genUserName(user.pubkey);
  const handle = metadata?.name;
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

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Banner */}
        <div className="relative h-32 sm:h-40 md:h-48 w-full">
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

        {/* Profile Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Avatar & Actions Row */}
          <div className="relative -mt-16 sm:-mt-20 mb-4 flex justify-between items-end">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#6600ff] to-[#eb00a8] rounded-full blur opacity-50" />
              <Avatar className="relative h-28 w-28 sm:h-32 sm:w-32 border-4 border-background">
                <AvatarImage src={picture} alt={displayName} className="object-cover" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-[#6600ff] to-[#9900ff] text-white">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-2">
              <Link to="/settings">
                <Button variant="outline" size="sm" className="h-9">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
              <Link to="/edit-profile">
                <Button size="sm" className="h-9 bg-[#6600ff] hover:bg-[#5500dd]">
                  <Edit3 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {displayName}
          </h1>

          {/* Handle */}
          {handle && (
            <p className="text-muted-foreground mb-3">@{handle}</p>
          )}

          {/* Bio */}
          {about && (
            <p className="text-foreground whitespace-pre-wrap leading-relaxed mb-4">
              {about}
            </p>
          )}

          {/* Verification & Links */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
            {nip05 && (
              <div className="flex items-center gap-1.5 text-[#6600ff]">
                <BadgeCheck className="h-4 w-4" />
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
                <span>{website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              </a>
            )}
            {lud16 && lud16 !== nip05 && (
              <div className="flex items-center gap-1.5 text-orange-500">
                <Zap className="h-4 w-4" />
                <span>{lud16}</span>
              </div>
            )}
          </div>

          {/* Npub */}
          <button
            onClick={copyNpub}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
          >
            <span className="font-mono text-xs">{npub.slice(0, 16)}...{npub.slice(-6)}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-6 border-b">
            {statsLoading ? (
              <>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-28" />
              </>
            ) : (
              <>
                <button 
                  className="flex items-center gap-1.5 hover:underline"
                  onClick={() => {
                    setFollowModalTab('following');
                    setShowFollowModal(true);
                  }}
                >
                  <span className="font-semibold">{formatNumber(following)}</span>
                  <span className="text-muted-foreground">Following</span>
                </button>
                <button 
                  className="flex items-center gap-1.5 hover:underline"
                  onClick={() => {
                    setFollowModalTab('followers');
                    setShowFollowModal(true);
                  }}
                >
                  <span className="font-semibold">{formatNumber(followers)}</span>
                  <span className="text-muted-foreground">Followers</span>
                </button>
              </>
            )}
            {zapsLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : zapsReceived > 0 && (
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">{formatNumber(zapsReceived)}</span>
                <span className="text-muted-foreground">sats received</span>
              </div>
            )}
          </div>

          {/* Future: Activity feed, posts, etc. would go here */}
          <div className="py-12 text-center text-muted-foreground">
            <p>Your activity and posts will appear here</p>
          </div>
        </div>

        {/* Follow List Modal */}
        {user && (
          <FollowListModal
            pubkey={user.pubkey}
            isOpen={showFollowModal}
            onClose={() => setShowFollowModal(false)}
            defaultTab={followModalTab}
          />
        )}
      </div>
    </Layout>
  );
};

export default Profile;
