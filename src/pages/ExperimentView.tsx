/**
 * ExperimentView Page
 * 
 * Full-screen lesson viewer for any experiment
 * URL: /experiment/:experimentId/:lessonId?
 * 
 * LOGIN REQUIRED: Users must log in to view experiment content (even Free tier)
 * Per membership tiers: Free tier includes "Read experiments (after login)"
 */

import { useParams, Navigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { LessonViewer } from '@/components/LessonViewer';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { morningMiracleExperiment } from '@/data/test-experiment';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Lock, Sparkles } from 'lucide-react';

// In the future, this will query experiments from Nostr
// For now, we have our test experiment
const EXPERIMENTS = [morningMiracleExperiment];

export default function ExperimentView() {
  const { experimentId, lessonId } = useParams<{ experimentId: string; lessonId?: string }>();
  const { user } = useCurrentUser();
  
  // Find the experiment
  const experiment = EXPERIMENTS.find((exp) => exp.id === experimentId);
  
  useSeoMeta({
    title: experiment ? `${experiment.title} - 11x LOVE LaB` : 'Experiment - 11x LOVE LaB',
    description: experiment?.description || 'Transform your life one experiment at a time',
  });
  
  // Redirect if experiment not found
  if (!experiment) {
    return <Navigate to="/experiments" replace />;
  }
  
  // Require login to view experiment content
  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto text-[#6600ff] mb-4" />
              <h1 className="text-3xl font-normal mb-4">{experiment.title}</h1>
              <p className="text-muted-foreground mb-6">
                {experiment.description}
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-normal">Login Required</h2>
                </div>
                <CardDescription>
                  Log in with your Nostr account to access this experiment
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
  
  // Show experiment to logged-in users
  return (
    <Layout>
      <LessonViewer experiment={experiment} initialLessonId={lessonId} />
    </Layout>
  );
}
