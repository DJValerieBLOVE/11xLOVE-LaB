import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const Tracker = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Daily Tracker - 11x LOVE LaB',
    description: 'Track your daily experiments and build your streak.',
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
                  Please log in to access your daily tracker.
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
        <h1 className="mb-6">🧪 Daily Experiment Tracker</h1>
        <p className="text-muted-foreground mb-8">
          Build your streak with daily check-ins and experiments.
        </p>

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔥</span>
                <span>Your Streak</span>
              </CardTitle>
              <CardDescription>
                Coming soon in Chunk 4! Track your daily experiments here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Daily check-ins, streak counter, and experiment history will appear here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Tracker;
