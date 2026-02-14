import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Clock, Users, Star, Heart } from 'lucide-react';
import { experiments } from '@/data/experiments';
import { morningMiracleExperiment } from '@/data/test-experiment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { Experiment } from '@/types/experiment';

const Experiments = () => {
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');

  useSeoMeta({
    title: 'Experiments - 11x LOVE LaB',
    description: 'Courses, experiments, and skill-building adventures',
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
                  Please log in to access experiments and lessons.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Combine new template-based experiments with legacy static experiments
  const allExperiments: Experiment[] = [
    morningMiracleExperiment,
    ...experiments,
  ];

  const filteredExperiments = allExperiments.filter(exp =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="mb-2">Grow</h1>
        <p className="text-muted-foreground mb-8">
          Courses, experiments, and skill-building adventures
        </p>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl">
          <Input
            type="search"
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Experiment Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((experiment) => {
            const totalLessons = experiment.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
            
            return (
              <Card key={experiment.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group flex flex-col min-h-[420px]">
                {/* Colored Header */}
                <div className={`h-36 bg-gradient-to-br ${experiment.color} flex items-center justify-center flex-shrink-0`}>
                  <h3 className="text-white text-2xl font-bold text-center px-4 line-clamp-2">
                    {experiment.title}
                  </h3>
                </div>

                <CardHeader className="pb-3 flex-shrink-0">
                  {/* Level Badges - Subtle gray style */}
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                      {experiment.level}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                      Value for Value
                    </Badge>
                  </div>

                  {/* Description - Fixed 2 lines max */}
                  <CardDescription className="text-sm line-clamp-2 min-h-[40px]">
                    {experiment.description}
                  </CardDescription>
                </CardHeader>

                {/* Spacer to push button to bottom */}
                <div className="flex-1" />

                <CardContent className="space-y-5 pb-6 flex-shrink-0">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{experiment.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{experiment.enrolled.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Rating and Instructor */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{experiment.rating}</span>
                    </div>
                    <span className="text-muted-foreground text-xs truncate">by {experiment.instructor}</span>
                  </div>

                  {/* View Experiment Button - Proper spacing */}
                  <Link to={`/experiment/${experiment.id}`} className="block mt-3">
                    <Button className="w-full">
                      View Experiment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredExperiments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No experiments found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Experiments;
