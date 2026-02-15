/**
 * ExperimentView Page
 * 
 * Full-screen lesson viewer for any experiment
 * URL: /experiment/:experimentId/:lessonId?
 * 
 * PUBLIC: Anyone can view lessons (good for SEO)
 * PRIVATE: Progress tracking, comments, zaps require login
 */

import { useParams, Navigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { LessonViewer } from '@/components/LessonViewer';
import { morningMiracleExperiment } from '@/data/test-experiment';

// In the future, this will query experiments from Nostr
// For now, we have our test experiment
const EXPERIMENTS = [morningMiracleExperiment];

export default function ExperimentView() {
  const { experimentId, lessonId } = useParams<{ experimentId: string; lessonId?: string }>();
  
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
  
  // PUBLIC: Show experiment to everyone
  // LessonViewer handles login prompts for interactive features
  return (
    <Layout>
      <LessonViewer experiment={experiment} initialLessonId={lessonId} />
    </Layout>
  );
}
