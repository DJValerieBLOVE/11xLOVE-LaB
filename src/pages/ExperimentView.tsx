/**
 * ExperimentView Page
 * 
 * Full-screen lesson viewer for any experiment
 * URL: /experiment/:experimentId/:lessonId?
 */

import { useParams, Navigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Layout } from '@/components/Layout';
import { LessonViewer } from '@/components/LessonViewer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { dummyCurriculum } from '@/data/dummyCurriculum';

// Convert dummy curriculum to experiment format
const EXPERIMENTS = dummyCurriculum.map(exp => ({
  id: exp.id,
  title: exp.title,
  description: exp.description,
  dimension: exp.dimension,
  level: 'Beginner',
  duration: `${exp.lessons.length} lessons`,
  instructor: 'DJ Valerie B LOVE',
  enrolled: Math.floor(Math.random() * 100) + 50,
  rating: Math.round((4.8 + Math.random() * 0.2) * 10) / 10,
  color: `from-[${exp.color}] to-[${exp.color}dd]`,
  valueForValue: true,
  createdBy: '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767',
  modules: [{
    id: 'module-1',
    title: exp.title,
    description: exp.description,
    lessons: exp.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      quiz: lesson.quiz,
      journalPrompt: lesson.journalPrompt,
      type: 'lesson' as const,
    }))
  }]
}));

export default function ExperimentView() {
  const { experimentId, lessonId } = useParams<{ experimentId: string; lessonId?: string }>();
  const { user } = useCurrentUser();
  
  // Find the experiment
  const experiment = EXPERIMENTS.find((exp) => exp.id === experimentId);
  console.log('Found experiment:', experiment);
  
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
  
  return (
    <Layout>
      <LessonViewer experiment={experiment} initialLessonId={lessonId} />
    </Layout>
  );
}
