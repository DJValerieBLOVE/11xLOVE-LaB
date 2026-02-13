import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const BigDreams = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Big Dreams - 11x LOVE LaB',
    description: 'Update your vision for each dimension',
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
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const dimensions = [
    { id: 'god-love', title: 'GOD/LOVE', color: 'border-pink-500', realized: 85 },
    { id: 'romance', title: 'Romance', color: 'border-red-500', realized: 60 },
    { id: 'family', title: 'Family', color: 'border-orange-500', realized: 75 },
    { id: 'community', title: 'Community', color: 'border-yellow-500', realized: 90 },
    { id: 'mission', title: 'Mission', color: 'border-gray-500', realized: 0 },
    { id: 'money', title: 'Money', color: 'border-gray-400', realized: 0 },
    { id: 'time', title: 'Time', color: 'border-cyan-500', realized: 0 },
    { id: 'environment', title: 'Environment', color: 'border-gray-300', realized: 0 },
    { id: 'body', title: 'Body', color: 'border-gray-200', realized: 0 },
    { id: 'mind', title: 'Mind', color: 'border-blue-500', realized: 0 },
    { id: 'spirit', title: 'Spirit', color: 'border-purple-500', realized: 0 },
  ];

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="mb-2">Big Dreams</h1>
        <p className="text-muted-foreground italic mb-8">
          "The future belongs to those who believe in the beauty of their dreams."
        </p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">My 11 Big Dreams</h2>
          <p className="text-sm text-muted-foreground">
            Update your vision for each dimension
          </p>
        </div>

        {/* Dreams Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {dimensions.map((dimension) => (
            <Card key={dimension.id} className={`border-t-4 ${dimension.color}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dimension.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">{dimension.realized}% Realized</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`What is your big dream for your ${dimension.title.toLowerCase()}?`}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button size="sm">
                    Save Vision
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BigDreams;
