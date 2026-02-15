import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMembership } from '@/hooks/useMembership';
import { Card, CardDescription, CardHeader, CardContent } from '@/components/ui/card';
import { Clock, Users, Heart, Sparkles, Plus, Lock, Bookmark, CheckCircle2, Play, Compass, Pencil } from 'lucide-react';
import { experiments } from '@/data/experiments';
import { morningMiracleExperiment } from '@/data/test-experiment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import type { Experiment } from '@/types/experiment';
import { LoginArea } from '@/components/auth/LoginArea';
import { DIMENSIONS } from '@/lib/dimensions';

const Experiments = () => {
  const { user } = useCurrentUser();
  const { canCreate, isLoggedIn, tierInfo } = useMembership();
  const [searchQuery, setSearchQuery] = useState('');
  const [dimensionFilter, setDimensionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('browse');

  useSeoMeta({
    title: 'Experiments - 11x LOVE LaB',
    description: 'Transform your life with experiments in the 11 dimensions of LOVE. Courses, challenges, and skill-building adventures for personal growth.',
  });

  // Combine all experiments
  const allExperiments: Experiment[] = [
    morningMiracleExperiment,
    ...experiments,
  ];

  // Filter experiments
  const filteredExperiments = allExperiments.filter(exp => {
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDimension = 
      dimensionFilter === 'all' || 
      exp.dimension?.toString() === dimensionFilter;
    
    return matchesSearch && matchesDimension;
  });

  // Mock data for tabs (will come from Nostr queries later)
  const inProgressExperiments: Experiment[] = []; // User's started experiments
  const savedExperiments: Experiment[] = []; // Bookmarked
  const completedExperiments: Experiment[] = []; // Finished
  const suggestedExperiments = allExperiments.slice(0, 3); // AI suggestions (placeholder)
  const myCreatedExperiments: Experiment[] = []; // Created by user

  // Require login
  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto text-[#6600ff] mb-4" />
              <h1 className="text-3xl font-bold mb-4">Experiments</h1>
              <p className="text-muted-foreground mb-6">
                Transform your life through guided experiments in the 11 dimensions of LOVE.
                Log in to track your progress and join the community.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold">Login Required</h2>
                </div>
                <CardDescription>
                  Create a free Nostr account to start your transformation journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginArea className="flex justify-center" />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="mb-2">Experiments</h1>
            <p className="text-muted-foreground">
              Transform your life through guided experiments
            </p>
          </div>
          
          {/* Create Button */}
          {canCreate ? (
            <Link to="/experiments/create">
              <Button className="bg-[#6600ff] hover:bg-[#5500dd]">
                <Plus className="h-4 w-4 mr-2" />
                Create Experiment
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => {/* Show upgrade modal */}}
              className="border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Experiment
              <Badge variant="secondary" className="ml-2 text-xs">Creator</Badge>
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto mb-6 flex-wrap">
            <TabsTrigger 
              value="in-progress" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]"
            >
              <Play className="h-4 w-4 mr-2" />
              In Progress
              {inProgressExperiments.length > 0 && (
                <Badge variant="secondary" className="ml-2">{inProgressExperiments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed
            </TabsTrigger>
            <TabsTrigger 
              value="for-you" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="browse" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]"
            >
              <Compass className="h-4 w-4 mr-2" />
              Browse All
            </TabsTrigger>
            {canCreate && (
              <TabsTrigger 
                value="my-created" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]"
              >
                <Pencil className="h-4 w-4 mr-2" />
                My Created
              </TabsTrigger>
            )}
          </TabsList>

          {/* In Progress Tab */}
          <TabsContent value="in-progress">
            {inProgressExperiments.length === 0 ? (
              <EmptyState 
                icon={<Play className="h-12 w-12" />}
                title="No experiments in progress"
                description="Start an experiment to begin your transformation journey"
                action={
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse Experiments
                  </Button>
                }
              />
            ) : (
              <ExperimentGrid experiments={inProgressExperiments} showProgress />
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            {savedExperiments.length === 0 ? (
              <EmptyState 
                icon={<Bookmark className="h-12 w-12" />}
                title="No saved experiments"
                description="Bookmark experiments you want to try later"
                action={
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse Experiments
                  </Button>
                }
              />
            ) : (
              <ExperimentGrid experiments={savedExperiments} />
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed">
            {completedExperiments.length === 0 ? (
              <EmptyState 
                icon={<CheckCircle2 className="h-12 w-12" />}
                title="No completed experiments yet"
                description="Finish an experiment to see it here"
                action={
                  <Button onClick={() => setActiveTab('in-progress')}>
                    Continue Learning
                  </Button>
                }
              />
            ) : (
              <ExperimentGrid experiments={completedExperiments} showCompleted />
            )}
          </TabsContent>

          {/* For You Tab */}
          <TabsContent value="for-you">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Based on your Big Dreams and activity, we think you'll love these experiments.
              </p>
            </div>
            <ExperimentGrid experiments={suggestedExperiments} />
          </TabsContent>

          {/* Browse All Tab */}
          <TabsContent value="browse">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search experiments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={dimensionFilter} onValueChange={setDimensionFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by Dimension" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dimensions</SelectItem>
                  {DIMENSIONS.map((dim) => (
                    <SelectItem key={dim.number} value={dim.number.toString()}>
                      {dim.emoji} {dim.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredExperiments.length === 0 ? (
              <EmptyState 
                icon={<Compass className="h-12 w-12" />}
                title="No experiments found"
                description={searchQuery ? `No results for "${searchQuery}"` : "No experiments available"}
              />
            ) : (
              <ExperimentGrid experiments={filteredExperiments} />
            )}
          </TabsContent>

          {/* My Created Tab */}
          {canCreate && (
            <TabsContent value="my-created">
              {myCreatedExperiments.length === 0 ? (
                <EmptyState 
                  icon={<Pencil className="h-12 w-12" />}
                  title="No experiments created yet"
                  description="Create your first experiment to share with the community"
                  action={
                    <Link to="/experiments/create">
                      <Button className="bg-[#6600ff] hover:bg-[#5500dd]">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Experiment
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <ExperimentGrid experiments={myCreatedExperiments} showEdit />
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action}
    </div>
  );
}

// Experiment Grid Component
interface ExperimentGridProps {
  experiments: Experiment[];
  showProgress?: boolean;
  showCompleted?: boolean;
  showEdit?: boolean;
}

function ExperimentGrid({ experiments, showProgress, showCompleted, showEdit }: ExperimentGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experiments.map((experiment) => (
        <ExperimentCard 
          key={experiment.id} 
          experiment={experiment} 
          showProgress={showProgress}
          showCompleted={showCompleted}
          showEdit={showEdit}
        />
      ))}
    </div>
  );
}

// Experiment Card Component
interface ExperimentCardProps {
  experiment: Experiment;
  showProgress?: boolean;
  showCompleted?: boolean;
  showEdit?: boolean;
}

function ExperimentCard({ experiment, showProgress, showCompleted, showEdit }: ExperimentCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group flex flex-col min-h-[420px]">
      {/* Colored Header */}
      <div className={`h-36 bg-gradient-to-br ${experiment.color} flex items-center justify-center flex-shrink-0 relative`}>
        <h3 className="text-white text-2xl font-bold text-center px-4 line-clamp-2">
          {experiment.title}
        </h3>
        
        {showProgress && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/30 rounded-full h-2">
              <div className="bg-white rounded-full h-2 w-1/3" /> {/* Mock progress */}
            </div>
          </div>
        )}
        
        {showCompleted && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 flex-shrink-0">
        {/* Level Badges */}
        <div className="flex gap-2 mb-3">
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
            {experiment.level}
          </Badge>
          {experiment.dimension && (
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
              {DIMENSIONS.find(d => d.number === experiment.dimension)?.emoji} Dimension {experiment.dimension}
            </Badge>
          )}
        </div>

        {/* Description */}
        <CardDescription className="text-sm line-clamp-2 min-h-[40px]">
          {experiment.description}
        </CardDescription>
      </CardHeader>

      {/* Spacer */}
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
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{experiment.rating}</span>
          </div>
          <span className="text-xs truncate">by {experiment.instructor}</span>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <Link to={`/experiment/${experiment.id}`} className="flex-1">
            <Button className="w-full">
              {showProgress ? 'Continue' : showCompleted ? 'Review' : 'View Experiment'}
            </Button>
          </Link>
          {showEdit && (
            <Link to={`/experiments/edit/${experiment.id}`}>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Experiments;
