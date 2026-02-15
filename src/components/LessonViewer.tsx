/**
 * LessonViewer Component
 * 
 * 3-Column LMS Layout:
 * - Left (20%): Course syllabus with module/lesson navigation
 * - Middle (60%): Lesson content (video, audio, text, resources, quiz)
 * - Right (20%): Comments and discussion
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSaveJournalEntry } from '@/hooks/useExperimentJournal';
import { useSaveExperimentProgress } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuizModal } from '@/components/QuizModal';
import { JournalPromptModal } from '@/components/JournalPromptModal';
import { CelebrationAnimation } from '@/components/CelebrationAnimation';
import { getRandomCelebration, playCelebrationSound } from '@/lib/celebrations';
import { 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  Headphones, 
  Download, 
  MessageSquare,
  Share2,
  Heart,
  Zap,
  ChevronRight,
  Sparkles,
  PartyPopper,
  BookOpen,
} from 'lucide-react';
import type { Experiment, Lesson, Module } from '@/types/experiment';
import { getDimensionColor } from '@/lib/dimensions';
import { genUserName } from '@/lib/genUserName';

interface LessonViewerProps {
  experiment: Experiment;
  initialLessonId?: string;
}

export function LessonViewer({ experiment, initialLessonId }: LessonViewerProps) {
  console.log('LessonViewer experiment:', experiment);
  console.log('LessonViewer initialLessonId:', initialLessonId);
  const { user } = useCurrentUser();
  
  // Get all lessons flattened for easy navigation
  const allLessons = experiment.modules.flatMap((module) => 
    module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title }))
  );
  
  // Find initial lesson or default to first
  const initialLesson = initialLessonId 
    ? allLessons.find(l => l.id === initialLessonId) 
    : allLessons[0];
    
  const [currentLesson, setCurrentLesson] = useState(initialLesson || allLessons[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [passedQuizzes, setPassedQuizzes] = useState<string[]>([]);
  const [showAudio, setShowAudio] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState(getRandomCelebration());
  
  // Load quiz attempts from localStorage
  useEffect(() => {
    const attemptData = localStorage.getItem(`quiz-attempt-${currentLesson.id}`);
    if (attemptData) {
      const { passed } = JSON.parse(attemptData);
      if (passed && !passedQuizzes.includes(currentLesson.id)) {
        setPassedQuizzes([...passedQuizzes, currentLesson.id]);
      }
    }
  }, [currentLesson.id]);
  
  // Calculate progress
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);
  const isExperimentComplete = completedCount === totalLessons;
  
  // Check if lesson can be marked complete
  const canMarkComplete = !currentLesson.quiz || passedQuizzes.includes(currentLesson.id);
  
  // Check if lesson is unlocked (sequential unlock)
  const isLessonUnlocked = (lessonId: string): boolean => {
    const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === 0) return true; // First lesson always unlocked
    
    const previousLesson = allLessons[lessonIndex - 1];
    return completedLessons.includes(previousLesson.id);
  };
  
  const handleMarkComplete = () => {
    if (!completedLessons.includes(currentLesson.id) && canMarkComplete) {
      setCompletedLessons([...completedLessons, currentLesson.id]);
      // TODO: Publish Nostr event (kind 30078)
    }
  };
  
  const handleQuizPass = async () => {
    if (!passedQuizzes.includes(currentLesson.id)) {
      setPassedQuizzes([...passedQuizzes, currentLesson.id]);
    }
    // Close quiz modal, open journal prompt
    setQuizModalOpen(false);
    setJournalModalOpen(true);
  };

  const { mutateAsync: saveJournalEntry } = useSaveJournalEntry(experiment);
  const saveProgress = useSaveExperimentProgress();

  const handleJournalSave = async () => {
    try {
      // Save journal entry to Nostr (Railway relay)
      await saveJournalEntry({
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        content: 'Journal entry content here' // This would come from journal modal
      });

      // Auto-complete lesson after journal entry
      if (!completedLessons.includes(currentLesson.id)) {
        setCompletedLessons([...completedLessons, currentLesson.id]);
        // Save progress to Nostr
        await saveProgress(experiment.id);
      }
      
      // Close journal, show celebration
      setJournalModalOpen(false);
      
      // Get random celebration
      const celebration = getRandomCelebration();
      setCurrentCelebration(celebration);
      
      // Play sound
      playCelebrationSound(celebration.sound);
      
      // Show animation
      setShowCelebration(true);
    } catch (error) {
      console.error('Failed to save journal/progress:', error);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    
    // Auto-advance to next lesson
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (isLessonUnlocked(nextLesson.id)) {
        setCurrentLesson(nextLesson);
      }
    }
  };
  
  const handleNextLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (isLessonUnlocked(nextLesson.id)) {
        setCurrentLesson(nextLesson);
      }
    }
  };
  
  const isCompleted = completedLessons.includes(currentLesson.id);
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const hasNextLesson = currentIndex < allLessons.length - 1;
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* LEFT COLUMN: Course Syllabus (25%) */}
      <aside className="w-1/4 border-r bg-muted/30 hidden lg:flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-1">{experiment.title}</h2>
          <div className="flex items-center gap-2 mb-3">
            <Progress value={progressPercentage} className="flex-1" />
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {completedCount} of {totalLessons} lessons complete
          </p>
          <Link to={`/experiment/${experiment.id}/journal`}>
            <Button variant="outline" size="sm" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              View My Journal
            </Button>
          </Link>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {experiment.modules.map((module, moduleIndex) => (
              <div key={module.id}>
                <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
                  Module {moduleIndex + 1}
                </h3>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const isUnlocked = isLessonUnlocked(lesson.id);
                    const isCurrentLesson = lesson.id === currentLesson.id;
                    const isLessonCompleted = completedLessons.includes(lesson.id);
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => isUnlocked && setCurrentLesson({ ...lesson, moduleId: module.id, moduleTitle: module.title })}
                        disabled={!isUnlocked}
                        className={`
                          w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                          ${isCurrentLesson ? 'bg-primary/10 text-primary font-medium' : ''}
                          ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          {isLessonCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : !isUnlocked ? (
                            <Lock className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <PlayCircle className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="flex-1 truncate">{lesson.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* MIDDLE COLUMN: Lesson Content (50%) */}
      <main className="flex-1 lg:w-1/2 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Lesson Header */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{'moduleTitle' in currentLesson ? currentLesson.moduleTitle : 'Module'}</span>
              <ChevronRight className="h-4 w-4" />
              <span>{currentLesson.duration}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentLesson.title}</h1>
            
            <div className="flex items-center gap-2">
              <Badge 
                style={{ 
                  backgroundColor: getDimensionColor(currentLesson.dimension),
                  color: 'white',
                }}
              >
                Dimension {currentLesson.dimension}
              </Badge>
            </div>
          </div>

          {/* Video Player */}
          {currentLesson.video && (
            <Card>
              <CardContent className="p-0">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-t-lg"
                    src={currentLesson.video.url}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                
                {/* Audio Toggle */}
                {currentLesson.audio && (
                  <div className="p-3 border-t bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAudio(!showAudio)}
                      className="w-full justify-start"
                    >
                      <Headphones className="h-4 w-4 mr-2" />
                      {showAudio ? 'Hide' : 'Show'} Audio Version
                    </Button>
                    
                    {showAudio && currentLesson.audio && (
                      <audio controls className="w-full mt-2">
                        <source src={currentLesson.audio.url} />
                        Your browser does not support audio playback.
                      </audio>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

  {/* Downloadable Resources */}
  {currentLesson.resources && currentLesson.resources.length > 0 && (
    <Card className="bg-blue-50/50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-4 w-4" />
          Downloadable Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentLesson.resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            download
            className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-blue-50 transition-colors group"
          >
            <div>
              <p className="font-medium group-hover:text-primary transition-colors text-sm">
                {resource.title}
              </p>
              {resource.size && (
                <p className="text-xs text-muted-foreground">{resource.size}</p>
              )}
            </div>
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ))}
      </CardContent>
    </Card>
  )}

          {/* Lesson Content */}
          <Card>
            <CardContent className="prose prose-lg max-w-none p-6">
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: currentLesson.content.replace(/\n/g, '<br />') }}
              />
            </CardContent>
          </Card>

          {/* Quiz Section - Only show if not completed yet */}
          {currentLesson.quiz && !isCompleted && (
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-lg">Test Your Knowledge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete this quiz to finish this lesson and move forward!
                </p>
                <div className="flex justify-center">
                  <Button onClick={() => setQuizModalOpen(true)}>
                    Take Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Only shows after quiz passed and lesson auto-completed */}
          {isCompleted && hasNextLesson && (
            <div className="flex justify-center">
              <Button onClick={handleNextLesson}>
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
          
          {/* Experiment fully complete - no next lesson */}
          {isCompleted && !hasNextLesson && (
            <div className="text-center py-4">
              <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                Last lesson complete! Check the celebration below. 🎉
              </p>
            </div>
          )}

          {/* Share to Feed (ONLY after completing FULL experiment) */}
          {isExperimentComplete && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <CardContent className="p-6 text-center space-y-3">
                <PartyPopper className="h-12 w-12 mx-auto text-purple-600" />
                <h3 className="text-xl font-bold">Experiment Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  You crushed it! Share your victory with the world.
                </p>
                <div className="flex justify-center">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share to Public Feed
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* RIGHT COLUMN: Comments (25%) */}
      <aside className="w-1/4 border-l bg-background hidden xl:flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Lesson Discussion
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Share insights with the Tribe
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {/* Comment Input */}
          {user && (
            <div className="mb-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] mb-2"
              />
              <Button size="sm" className="w-full">
                Post Comment
              </Button>
            </div>
          )}

          {/* Sample Comments (will be from Nostr) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.metadata?.picture} />
                  <AvatarFallback>VIP</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">
                      {user?.metadata?.name || 'VIP Member'}
                    </span>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <p className="text-sm">
                    This morning ritual changed my life! Already feeling more energized. 🌅
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {/* Heart (Like) */}
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors group">
                      <Heart className="h-4 w-4 group-hover:fill-red-500" />
                      <span className="text-xs">12</span>
                    </button>
                    
                    {/* Zap (Send Sats) */}
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-orange-500 transition-colors">
                      <Zap className="h-4 w-4" />
                    </button>
                    
                    {/* Reply */}
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <p className="text-xs text-muted-foreground text-center py-4">
              Comments will load from Nostr relay
            </p>
          </div>
        </ScrollArea>
      </aside>

      {/* Quiz Modal */}
      {currentLesson.quiz && (
        <QuizModal
          quiz={currentLesson.quiz}
          lessonId={currentLesson.id}
          open={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          onPass={handleQuizPass}
        />
      )}

      {/* Journal Prompt Modal */}
      <JournalPromptModal
        experiment={experiment}
        lesson={currentLesson}
        open={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        onSave={handleJournalSave}
      />

      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation
          animation={currentCelebration.animation}
          onComplete={handleCelebrationComplete}
          duration={2500}
        />
      )}
    </div>
  );
}
