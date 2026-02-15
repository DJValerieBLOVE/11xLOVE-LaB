import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';

const Profile = () => {
  const currentUserData = useCurrentUser();
  const { user, metadata } = currentUserData;

  console.log('[Profile] useCurrentUser returned:', currentUserData);
  console.log('[Profile] user:', user);
  console.log('[Profile] metadata:', metadata);

  useSeoMeta({
    title: 'Profile - 11x LOVE LaB',
    description: 'View and manage your profile.',
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
                  Please log in to view your profile.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = metadata?.name || genUserName(user.pubkey);
  const about = metadata?.about || 'No bio yet';
  const picture = metadata?.picture;

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="mb-6">Your Profile</h1>

        <div className="max-w-2xl space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={picture} alt={displayName} />
                  <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{displayName}</CardTitle>
                  <CardDescription className="mt-2">{about}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Nostr Pubkey:</span>
                  <p className="text-muted-foreground break-all font-mono text-xs mt-1">
                    {user.pubkey}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>
                Coming soon in Chunk 8! Your complete dashboard will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track experiments completed, current streaks, and achievements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
