import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Calendar } from 'lucide-react';

const Events = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Events - 11x LOVE LaB',
    description: 'Join live events, workshops, and community gatherings.',
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
                  Please log in to view upcoming events.
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
        <h1 className="mb-6">Events</h1>
        <p className="text-muted-foreground mb-8">
          Live workshops, community calls, and special gatherings.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>
              Coming soon! Event calendar and registration will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stay tuned for live workshops, community calls, and special gatherings.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Events;
