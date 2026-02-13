import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, CheckSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: '11x LOVE LaB - Transform Your Life',
    description: 'Your private coaching community for personal growth, experiments, and transformation.',
  });

  const features = [
    {
      icon: BookOpen,
      title: 'Experiments',
      description: 'Sequential lessons designed to transform your life',
      href: '/experiments',
      gradient: 'from-pink to-pink-light',
    },
    {
      icon: Users,
      title: 'Tribe',
      description: 'Connect with like-minded souls on the journey',
      href: '/tribe',
      gradient: 'from-pink-light to-pink',
    },
    {
      icon: CheckSquare,
      title: 'Daily Tracker',
      description: 'Build streaks and track your daily experiments',
      href: '/tracker',
      gradient: 'from-pink to-pink-light',
    },
  ];

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Sparkles className="h-16 w-16 md:h-20 md:w-20 text-gray-300" />
          </div>
          <h1 className="mb-6">
            Welcome to the 11x LOVE LaB
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {user ? (
              <>
                Hey there, beautiful soul! 💜 Ready to continue your transformation journey?
              </>
            ) : (
              <>
                A private coaching community for personal growth and transformation. Log in to begin your journey.
              </>
            )}
          </p>
        </div>

        {/* Feature Cards */}
        {user ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} to={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-gray-400" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Ready to Begin?</CardTitle>
                <CardDescription>
                  Log in with your Nostr key to access your experiments, tribe, and daily tracker.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <p className="text-sm text-muted-foreground">
                    New to Nostr? No problem! Click "Sign Up" in the header to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
