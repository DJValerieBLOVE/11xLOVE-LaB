/**
 * JournalView Page
 * 
 * View the user's complete journal for a specific experiment
 * URL: /experiment/:experimentId/journal
 */

import { useParams, Navigate, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useExperimentJournal } from '@/hooks/useExperimentJournal';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Lock, ArrowLeft, Download, Share2 } from 'lucide-react';
import { morningMiracleExperiment } from '@/data/test-experiment';

// In the future, this will query experiments from Nostr
const EXPERIMENTS = [morningMiracleExperiment];

export default function JournalView() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { user } = useCurrentUser();
  
  // Find the experiment
  const experiment = EXPERIMENTS.find((exp) => exp.id === experimentId);
  
  useSeoMeta({
    title: experiment ? `${experiment.title} - Journal` : 'Journal - 11x LOVE LaB',
    description: 'Your personal learning journal and transformation notes',
  });
  
  // Redirect if experiment not found
  if (!experiment) {
    return <Navigate to="/experiments" replace />;
  }
  
  // Use journal hook (must be called before any conditional returns)
  const { data: journal, isLoading } = useExperimentJournal(experiment);
  
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
                  Please log in to view your journal.
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
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/experiment/${experimentId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Experiment
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-purple-600" />
                My Journal
              </h1>
              <p className="text-xl text-muted-foreground">{experiment.title}</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
        
        {/* Journal Content */}
        <Card>
          <CardHeader>
            <CardTitle>Your Learning Journey</CardTitle>
            <CardDescription>
              {journal?.entries.length || 0} entries • Started {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {isLoading && (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-20 w-full" />
                      <Separator className="my-6" />
                    </div>
                  ))}
                </div>
              )}
              
              {!isLoading && journal && journal.entries.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Journal Entries Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start completing lessons to build your knowledge vault!
                  </p>
                  <Link to={`/experiment/${experimentId}`}>
                    <Button>
                      Start Learning
                    </Button>
                  </Link>
                </div>
              )}
              
              {!isLoading && journal && journal.entries.length > 0 && (
                <div className="space-y-8">
                  {journal.entries.map((entry, index) => (
                    <div key={index}>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-1">{entry.lessonTitle}</h3>
                        <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                      </div>
                      {index < journal.entries.length - 1 && (
                        <Separator className="mt-8" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Tips Card */}
        <Card className="mt-6 bg-purple-50/50 border-purple-200">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              💜 <strong>Pro Tip:</strong> Your journal is stored on Nostr and syncs across devices. 
              Review your entries regularly to reinforce your learning and track your growth!
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
