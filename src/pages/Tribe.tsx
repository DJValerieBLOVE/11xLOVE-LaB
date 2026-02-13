import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

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
        <h1 className="mb-6">🔥 11x LOVE Tribe</h1>
        <p className="text-muted-foreground mb-8">
          Your private community of souls on the transformation journey.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Tribe</CardTitle>
            <CardDescription>
              Coming soon in Chunk 5! This will be your private NIP-29 community space.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Here you'll be able to connect, share, and support each other on your journeys.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Tribe;
