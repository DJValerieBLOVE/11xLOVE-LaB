/**
 * OnboardingModal Component
 * 
 * Two-path onboarding for new users:
 * - Quick Start: Simple Big Dreams input for all 11 dimensions
 * - Deep Dive: Full 11x LOVE Code curriculum
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { DIMENSIONS } from '@/lib/dimensions';
import { useSaveBigDream } from '@/hooks/useBigDreams';
import { useToast } from '@/hooks/useToast';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const navigate = useNavigate();
  const { mutateAsync: saveBigDream } = useSaveBigDream();
  const { toast } = useToast();

  const [step, setStep] = useState<'choice' | 'quick-start'>('choice');
  const [dreams, setDreams] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const handleQuickStart = () => {
    setStep('quick-start');
  };

  const handleDeepDive = () => {
    // Redirect to the 11x LOVE Code experiment
    onComplete();
    navigate('/experiment/11x-love-code');
  };

  const handleDreamChange = (dimensionId: number, value: string) => {
    setDreams({
      ...dreams,
      [dimensionId]: value,
    });
  };

  const handleSaveAllDreams = async () => {
    setSaving(true);

    try {
      // Save all Big Dreams that have content
      const savePromises = DIMENSIONS.map(async (dimension) => {
        const content = dreams[dimension.id]?.trim();
        if (content && content.length > 0) {
          await saveBigDream({ dimension, content });
        }
      });

      await Promise.all(savePromises);

      toast({
        title: 'Big Dreams Saved!',
        description: 'Your visions have been saved securely. Welcome to 11x LOVE LaB! 💜',
      });

      onComplete();
    } catch (error) {
      toast({
        title: 'Failed to Save',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const hasAnyDreams = Object.values(dreams).some((content) => content?.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === 'choice' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <span>💜</span>
                Welcome to 11x LOVE LaB!
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Choose your path to start creating your Divine Masterpiece
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 py-6">
              {/* Quick Start Path */}
              <Card className="border-2 hover:border-[#6600ff] transition-colors cursor-pointer" onClick={handleQuickStart}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-[#6600ff]" />
                    </div>
                    <CardTitle>Quick Start</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set your Big Dreams for all 11 dimensions in minutes. Perfect for getting started quickly.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#6600ff]">✓</span>
                      <span>1-2 sentence vision for each dimension</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6600ff]">✓</span>
                      <span>Takes about 10-15 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6600ff]">✓</span>
                      <span>You can dive deeper anytime</span>
                    </li>
                  </ul>
                  <Button className="w-full" onClick={handleQuickStart}>
                    Start Quick Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Deep Dive Path */}
              <Card className="border-2 hover:border-[#6600ff] transition-colors cursor-pointer" onClick={handleDeepDive}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-[#6600ff]" />
                    </div>
                    <CardTitle>Deep Dive</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Take the full 11x LOVE Code journey. A comprehensive exploration of your vision across all dimensions.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#6600ff]">✓</span>
                      <span>Complete curriculum with 18 lessons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6600ff]">✓</span>
                      <span>Detailed Vision Board creation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6600ff]">✓</span>
                      <span>Daily practice setup</span>
                    </li>
                  </ul>
                  <Button className="w-full" onClick={handleDeepDive}>
                    Start 11x LOVE Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {step === 'quick-start' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Quick Start: Your 11 Big Dreams</DialogTitle>
              <DialogDescription className="text-base pt-2">
                Write a 1-2 sentence vision for each dimension. You can always edit these later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {DIMENSIONS.map((dimension) => (
                <Card 
                  key={dimension.id} 
                  className="border-l-4" 
                  style={{ borderLeftColor: dimension.color }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>{dimension.emoji}</span>
                      <span>{dimension.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={dreams[dimension.id] || ''}
                      onChange={(e) => handleDreamChange(dimension.id, e.target.value)}
                      placeholder={`What is your big dream for ${dimension.name.toLowerCase()}?`}
                      className="min-h-[60px] resize-none text-sm"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setStep('choice')}
                disabled={saving}
              >
                Back
              </Button>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {hasAnyDreams ? 'Ready to save your visions' : 'Add at least one dream to continue'}
                </p>
                <Button
                  onClick={handleSaveAllDreams}
                  disabled={!hasAnyDreams || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
