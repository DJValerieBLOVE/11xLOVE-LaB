import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Clock, Users, Star } from 'lucide-react';
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
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Experiment Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((experiment) => {
            const totalLessons = experiment.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
            
            return (
              <Card key={experiment.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
                {/* Colored Header */}
                <div className={`h-32 bg-gradient-to-br ${experiment.color} flex items-center justify-center`}>
                  <h3 className="text-white text-2xl font-bold text-center px-4">
                    {experiment.title}
                  </h3>
                </div>

                <CardHeader className="pb-3">
                  {/* Level Badge */}
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                      {experiment.level}
                    </Badge>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                      Value for Value
                    </Badge>
                  </div>

                  <CardDescription className="text-base">
                    {experiment.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
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
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{experiment.rating}</span>
                    </div>
                    <span className="text-muted-foreground">by {experiment.instructor}</span>
                  </div>

                  {/* View Course Button */}
                  <Link to={`/experiment/${experiment.id}`}>
                    <Button className="w-full" size="lg">
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
