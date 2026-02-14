/**
 * JournalPromptModal Component
 * 
 * Prompts user to add a journal entry after completing a quiz
 * Shows previous entries (collapsed) and new entry field
 * Obsidian-style growing knowledge vault!
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { useExperimentJournal, useSaveJournalEntry } from '@/hooks/useExperimentJournal';
import type { Experiment, Lesson } from '@/types/experiment';

interface JournalPromptModalProps {
  experiment: Experiment;
  lesson: Lesson;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function JournalPromptModal({
  experiment,
  lesson,
  open,
  onClose,
  onSave,
}: JournalPromptModalProps) {
  const [newEntry, setNewEntry] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  const { data: journal, isLoading } = useExperimentJournal(experiment);
  const { mutate: saveEntry, isPending } = useSaveJournalEntry(experiment);

  const handleSave = () => {
    if (!newEntry.trim()) {
      // User skipped journal entry
      onSave();
      return;
    }

    saveEntry(
      {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        content: newEntry,
      },
      {
        onSuccess: () => {
          setNewEntry('');
          onSave();
        },
      }
    );
  };

  const toggleEntry = (index: number) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Your {experiment.title} Journal
          </DialogTitle>
          <DialogDescription>
            Capture your insights and track your transformation journey
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
          <div className="space-y-4 py-4">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading your journal...</p>
              </div>
            )}

            {/* Previous Entries (Collapsed) */}
            {journal && journal.entries.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Previous Entries
                </h3>
                {journal.entries.map((entry, index) => (
                  <Collapsible
                    key={index}
                    open={expandedEntries.has(index)}
                    onOpenChange={() => toggleEntry(index)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-left font-normal"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{entry.lessonTitle}</p>
                          <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedEntries.has(index) ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 py-2 bg-muted/30 rounded-lg mt-1">
                      <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                <Separator className="my-4" />
              </div>
            )}

            {/* New Entry Prompt */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold">Today's Reflection: {lesson.title}</h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  What did you learn? How will you apply it? What are you grateful for?
                </p>
                <Textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="Share your insights, breakthroughs, or questions..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground italic">
                  💜 This is YOUR vault of wisdom. Every entry builds your transformation story.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={handleSave}
            disabled={isPending}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Save & Continue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
