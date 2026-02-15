/**
 * Experiment Builder Page
 * 
 * Create and edit experiments (courses)
 * URL: /experiments/create or /experiments/edit/:id
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMembership } from '@/hooks/useMembership';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Lock, 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  Save,
  Eye,
  ArrowLeft,
  Sparkles,
  Video,
  FileText,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { DIMENSIONS } from '@/lib/dimensions';
import { useToast } from '@/hooks/useToast';
import { LoginArea } from '@/components/auth/LoginArea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Types for the builder
interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface LessonData {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  videoProvider: 'youtube' | 'vimeo' | 'rumble' | 'other';
  content: string;
  journalPrompt: string;
  quiz: {
    passingScore: number;
    questions: QuizQuestion[];
  };
}

interface ModuleData {
  id: string;
  title: string;
  description: string;
  lessons: LessonData[];
  isExpanded: boolean;
}

interface ExperimentData {
  title: string;
  description: string;
  dimension: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  coverGradient: string;
  modules: ModuleData[];
  status: 'draft' | 'published';
}

const GRADIENT_OPTIONS = [
  { value: 'from-[#6600ff] to-[#9900ff]', label: 'Purple' },
  { value: 'from-[#eb00a8] to-[#ff3dbf]', label: 'Pink' },
  { value: 'from-[#00b4d8] to-[#0077b6]', label: 'Blue' },
  { value: 'from-[#2ecc71] to-[#27ae60]', label: 'Green' },
  { value: 'from-[#f39c12] to-[#e74c3c]', label: 'Orange' },
  { value: 'from-[#9b59b6] to-[#8e44ad]', label: 'Violet' },
];

export default function ExperimentBuilder() {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { canCreate, isLoggedIn } = useMembership();
  const { toast } = useToast();
  
  const isEditing = !!experimentId;
  
  // Form state
  const [experiment, setExperiment] = useState<ExperimentData>({
    title: '',
    description: '',
    dimension: '',
    level: 'Beginner',
    coverGradient: GRADIENT_OPTIONS[0].value,
    modules: [],
    status: 'draft',
  });
  
  const [activeTab, setActiveTab] = useState('basics');
  const [isSaving, setIsSaving] = useState(false);

  useSeoMeta({
    title: isEditing ? 'Edit Experiment - 11x LOVE LaB' : 'Create Experiment - 11x LOVE LaB',
    description: 'Build transformational experiments for the 11x LOVE LaB community',
  });

  // Not logged in
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
                  Please log in to create experiments.
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

  // Not a creator
  if (!canCreate) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <Sparkles className="h-16 w-16 mx-auto text-[#6600ff] mb-4" />
            <h1 className="text-2xl font-bold mb-4">Become a Creator</h1>
            <p className="text-muted-foreground mb-6">
              To create experiments, you need to be on the Creator tier or bring your own API key (BYOK).
            </p>
            
            <Card className="text-left">
              <CardHeader>
                <CardTitle>Creator Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Create unlimited experiments</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>AI-powered content assistance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600">⚡</span>
                  </div>
                  <span>Earn zaps from your students</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 space-y-3">
              <Button className="w-full bg-[#6600ff] hover:bg-[#5500dd]">
                Upgrade to Creator ($33/mo)
              </Button>
              <Button variant="outline" className="w-full">
                Bring Your Own Key ($11/mo)
              </Button>
              <Button variant="ghost" onClick={() => navigate('/experiments')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Experiments
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Add a new module
  const addModule = () => {
    const newModule: ModuleData = {
      id: `module-${Date.now()}`,
      title: `Module ${experiment.modules.length + 1}`,
      description: '',
      lessons: [],
      isExpanded: true,
    };
    setExperiment({ ...experiment, modules: [...experiment.modules, newModule] });
  };

  // Remove a module
  const removeModule = (moduleId: string) => {
    setExperiment({
      ...experiment,
      modules: experiment.modules.filter(m => m.id !== moduleId),
    });
  };

  // Update a module
  const updateModule = (moduleId: string, updates: Partial<ModuleData>) => {
    setExperiment({
      ...experiment,
      modules: experiment.modules.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    });
  };

  // Add a lesson to a module
  const addLesson = (moduleId: string) => {
    const module = experiment.modules.find(m => m.id === moduleId);
    if (!module) return;

    const newLesson: LessonData = {
      id: `lesson-${Date.now()}`,
      title: `Lesson ${module.lessons.length + 1}`,
      duration: '5 min',
      videoUrl: '',
      videoProvider: 'youtube',
      content: '',
      journalPrompt: 'What did you discover in this lesson?',
      quiz: {
        passingScore: 70,
        questions: [],
      },
    };

    updateModule(moduleId, {
      lessons: [...module.lessons, newLesson],
    });
  };

  // Remove a lesson
  const removeLesson = (moduleId: string, lessonId: string) => {
    const module = experiment.modules.find(m => m.id === moduleId);
    if (!module) return;

    updateModule(moduleId, {
      lessons: module.lessons.filter(l => l.id !== lessonId),
    });
  };

  // Update a lesson
  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<LessonData>) => {
    const module = experiment.modules.find(m => m.id === moduleId);
    if (!module) return;

    updateModule(moduleId, {
      lessons: module.lessons.map(l =>
        l.id === lessonId ? { ...l, ...updates } : l
      ),
    });
  };

  // Save experiment
  const handleSave = async (publish: boolean = false) => {
    // Validation
    if (!experiment.title.trim()) {
      toast({ title: 'Error', description: 'Please enter a title', variant: 'destructive' });
      return;
    }
    if (!experiment.dimension) {
      toast({ title: 'Error', description: 'Please select a dimension', variant: 'destructive' });
      return;
    }
    if (experiment.modules.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one module', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Save to Nostr (Railway relay)
      // For now, just show success message
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save

      toast({
        title: publish ? '🎉 Experiment Published!' : '💾 Draft Saved',
        description: publish 
          ? 'Your experiment is now live for the community' 
          : 'Your progress has been saved',
      });

      if (publish) {
        navigate('/experiments');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save experiment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/experiments')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Experiment' : 'Create Experiment'}
              </h1>
              <p className="text-muted-foreground">
                Build transformational content for your community
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              className="bg-[#6600ff] hover:bg-[#5500dd]" 
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        {/* Builder Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="basics">
              <FileText className="h-4 w-4 mr-2" />
              Basics
            </TabsTrigger>
            <TabsTrigger value="modules">
              <BookOpen className="h-4 w-4 mr-2" />
              Modules & Lessons
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Basics Tab */}
          <TabsContent value="basics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Experiment Details</CardTitle>
                  <CardDescription>Basic information about your experiment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Morning Miracle Challenge"
                      value={experiment.title}
                      onChange={(e) => setExperiment({ ...experiment, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What will students learn? What transformation will they experience?"
                      value={experiment.description}
                      onChange={(e) => setExperiment({ ...experiment, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimension">Dimension * (Required for filtering)</Label>
                    <Select 
                      value={experiment.dimension} 
                      onValueChange={(v) => setExperiment({ ...experiment, dimension: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dimension" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIMENSIONS.map((dim) => (
                          <SelectItem key={dim.number} value={dim.number.toString()}>
                            {dim.emoji} {dim.name} - {dim.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Difficulty Level</Label>
                    <Select 
                      value={experiment.level} 
                      onValueChange={(v) => setExperiment({ ...experiment, level: v as ExperimentData['level'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>How your experiment looks in the catalog</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cover Gradient</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {GRADIENT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setExperiment({ ...experiment, coverGradient: option.value })}
                          className={`h-16 rounded-lg bg-gradient-to-br ${option.value} transition-all ${
                            experiment.coverGradient === option.value 
                              ? 'ring-2 ring-offset-2 ring-[#6600ff]' 
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <div className={`h-24 bg-gradient-to-br ${experiment.coverGradient} flex items-center justify-center p-4`}>
                        <span className="text-white font-bold text-center line-clamp-2">
                          {experiment.title || 'Your Experiment Title'}
                        </span>
                      </div>
                      <div className="p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {experiment.description || 'Your experiment description will appear here...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Modules & Lessons Tab */}
          <TabsContent value="modules">
            <div className="space-y-4">
              {experiment.modules.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No modules yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first module to start building your experiment
                    </p>
                    <Button onClick={addModule}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {experiment.modules.map((module, moduleIndex) => (
                    <ModuleEditor
                      key={module.id}
                      module={module}
                      moduleIndex={moduleIndex}
                      onUpdate={(updates) => updateModule(module.id, updates)}
                      onRemove={() => removeModule(module.id)}
                      onAddLesson={() => addLesson(module.id)}
                      onRemoveLesson={(lessonId) => removeLesson(module.id, lessonId)}
                      onUpdateLesson={(lessonId, updates) => updateLesson(module.id, lessonId, updates)}
                    />
                  ))}
                  
                  <Button variant="outline" onClick={addModule} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardContent className="py-12 text-center">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Preview Coming Soon</h3>
                <p className="text-muted-foreground">
                  See how your experiment will look to students
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Module Editor Component
interface ModuleEditorProps {
  module: ModuleData;
  moduleIndex: number;
  onUpdate: (updates: Partial<ModuleData>) => void;
  onRemove: () => void;
  onAddLesson: () => void;
  onRemoveLesson: (lessonId: string) => void;
  onUpdateLesson: (lessonId: string, updates: Partial<LessonData>) => void;
}

function ModuleEditor({ 
  module, 
  moduleIndex, 
  onUpdate, 
  onRemove, 
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
}: ModuleEditorProps) {
  return (
    <Collapsible open={module.isExpanded} onOpenChange={(open) => onUpdate({ isExpanded: open })}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {module.isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <div className="flex-1">
              <Input
                value={module.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="font-semibold text-lg h-auto py-1 px-2"
                placeholder="Module Title"
              />
            </div>
            
            <Badge variant="outline">{module.lessons.length} lessons</Badge>
            
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Textarea
              value={module.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Module description (optional)"
              rows={2}
            />
            
            <Separator />
            
            {/* Lessons */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Lessons</h4>
              
              {module.lessons.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">No lessons in this module</p>
                  <Button variant="outline" size="sm" onClick={onAddLesson}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Lesson
                  </Button>
                </div>
              ) : (
                <>
                  {module.lessons.map((lesson, lessonIndex) => (
                    <LessonEditor
                      key={lesson.id}
                      lesson={lesson}
                      lessonIndex={lessonIndex}
                      onUpdate={(updates) => onUpdateLesson(lesson.id, updates)}
                      onRemove={() => onRemoveLesson(lesson.id)}
                    />
                  ))}
                  
                  <Button variant="outline" size="sm" onClick={onAddLesson}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Lesson
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Lesson Editor Component
interface LessonEditorProps {
  lesson: LessonData;
  lessonIndex: number;
  onUpdate: (updates: Partial<LessonData>) => void;
  onRemove: () => void;
}

function LessonEditor({ lesson, lessonIndex, onUpdate, onRemove }: LessonEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <span className="text-sm text-muted-foreground w-6">{lessonIndex + 1}.</span>
          
          <Input
            value={lesson.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="flex-1 h-8 text-sm"
            placeholder="Lesson Title"
          />
          
          <Input
            value={lesson.duration}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            className="w-20 h-8 text-sm"
            placeholder="5 min"
          />
          
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7 text-red-500 hover:text-red-600">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        <CollapsibleContent>
          <div className="mt-4 space-y-4 pl-12">
            {/* Video */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video URL
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={lesson.videoProvider} 
                  onValueChange={(v) => onUpdate({ videoProvider: v as LessonData['videoProvider'] })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="rumble">Rumble</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={lesson.videoUrl}
                  onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                  placeholder="https://youtube.com/embed/..."
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Lesson Content (Markdown)
              </Label>
              <Textarea
                value={lesson.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Write your lesson content here... Supports markdown!"
                rows={6}
              />
            </div>
            
            {/* Journal Prompt */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Journal Prompt
              </Label>
              <Input
                value={lesson.journalPrompt}
                onChange={(e) => onUpdate({ journalPrompt: e.target.value })}
                placeholder="What did you discover in this lesson?"
              />
            </div>
            
            {/* Quiz Section */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Quiz ({lesson.quiz.questions.length} questions)
              </Label>
              <p className="text-xs text-muted-foreground">
                Quiz builder coming soon. For now, quizzes can be added via the code editor.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
