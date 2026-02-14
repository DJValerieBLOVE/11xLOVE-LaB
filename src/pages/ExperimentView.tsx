/**
 * ExperimentView Page
 * 
 * Full-screen lesson viewer for any experiment
 * URL: /experiment/:experimentId/:lessonId?
 */

import { useParams, Navigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LessonViewer } from '@/components/LessonViewer';
import { morningMiracleExperiment } from '@/data/test-experiment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

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
  
  // Require login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
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
    );
  }
  
  return <LessonViewer experiment={experiment} initialLessonId={lessonId} />;
}
