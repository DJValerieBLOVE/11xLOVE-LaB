import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const Experiments = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Experiments - 11x LOVE LaB',
    description: 'Explore sequential lessons designed for your transformation.',
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
                  Please log in to access your experiments and lessons.
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
        <h1 className="mb-6">Your Experiments</h1>
        <p className="text-muted-foreground mb-8">
          Sequential lessons designed to transform your life. Complete each lesson to unlock the next.
        </p>

        <div className="grid gap-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💜</span>
                <span>The 11x LOVE Code</span>
              </CardTitle>
              <CardDescription>
                Your introduction to the 11 Dimensions of LOVE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming soon in Chunk 3! This will display your experiments with sequential unlock.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Experiments;
