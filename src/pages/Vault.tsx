/**
 * The Vault Page
 * 
 * User's private space with:
 * - Daily LOVE Practice (streaks)
 * - Journal / Lab Notes
 * - Magic Mentor Training
 * - Data Export (OWN YOUR DATA!)
 * - Bookmarks, Assessments, Library
 */

import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMembership } from '@/hooks/useMembership';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lock, 
  Heart, 
  BookText, 
  Bookmark, 
  ClipboardList, 
  Music, 
  Library, 
  FileText,
  Download,
  Upload,
  Bot,
  Brain,
  Shield,
  Server,
  Key,
  Sparkles,
  Settings,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LoginArea } from '@/components/auth/LoginArea';
import { Separator } from '@/components/ui/separator';
import type { NostrEvent } from '@nostrify/nostrify';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Vault = () => {
  const { user } = useCurrentUser();
  const { isPaidMember } = useMembership();
  const { nostr } = useNostr();
  const [customRelayUrl, setCustomRelayUrl] = useState('');
  const [mentorInstructions, setMentorInstructions] = useState('');

  useSeoMeta({
    title: 'The Vault - 11x LOVE LaB',
    description: 'Your private space for growth, reflection, and data ownership',
  });

  // Query all journal entries (kind 30023)
  const { data: journals, isLoading: journalsLoading } = useQuery({
    queryKey: ['all-journals', user?.pubkey],
    queryFn: async () => {
      if (!user) return [];

      const events = await nostr.query([
        {
          kinds: [30023],
          authors: [user.pubkey],
          '#t': ['journal'],
          limit: 50,
        },
      ]);

      return events;
    },
    enabled: !!user,
  });

  // Sample streak data (will come from relay in Chunk 4)
  const currentStreak = 7;
  const longestStreak = 30;
  const completeDays = 124;

  // Export all data as JSON
  const handleExportData = async () => {
    if (!user) return;

    try {
      // Query all user data from relay
      const allEvents = await nostr.query([
        {
          kinds: [30078, 30023, 1, 7], // Progress, journals, posts, reactions
          authors: [user.pubkey],
          limit: 1000,
        },
      ]);

      // Create export object
      const exportData = {
        exportedAt: new Date().toISOString(),
        pubkey: user.pubkey,
        totalEvents: allEvents.length,
        events: allEvents,
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `11x-love-lab-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-8">
              <Shield className="h-16 w-16 mx-auto text-[#6600ff] mb-4" />
              <h1 className="text-3xl font-bold mb-4">The Vault</h1>
              <p className="text-muted-foreground mb-6">
                Your private space for growth, reflection, and data ownership.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Login Required</CardTitle>
                </div>
                <CardDescription>
                  Log in to access your Vault
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">The Vault</h1>
            <p className="text-muted-foreground">
              Your private space for growth, reflection, and data ownership
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="daily-love" className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto mb-6 flex-wrap">
            <TabsTrigger value="daily-love" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Heart className="h-4 w-4 mr-2" />
              Daily LOVE
            </TabsTrigger>
            <TabsTrigger value="journal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <BookText className="h-4 w-4 mr-2" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="mentor" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Bot className="h-4 w-4 mr-2" />
              Magic Mentor
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Shield className="h-4 w-4 mr-2" />
              My Data
            </TabsTrigger>
            <TabsTrigger value="library" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Library className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
          </TabsList>

          {/* Daily LOVE Tab */}
          <TabsContent value="daily-love" className="space-y-6">
            {/* Streak Calendar */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span>{currentStreak} day streak</span>
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="text-purple-600 font-medium">Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-purple-100 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-300 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                      <div className="w-3 h-3 bg-purple-700 rounded-sm"></div>
                    </div>
                    <span className="text-purple-600 font-medium">More</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* GitHub-style contribution graph */}
                <div className="space-y-2 overflow-x-auto">
                  {['M', 'W', 'F', 'S'].map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{day}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 52 }).map((_, i) => {
                          const intensity = Math.random();
                          const bgColor = 
                            intensity > 0.75 ? 'bg-purple-700' :
                            intensity > 0.5 ? 'bg-purple-500' :
                            intensity > 0.25 ? 'bg-purple-300' :
                            intensity > 0.1 ? 'bg-purple-100' :
                            'bg-gray-100';
                          return (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-sm ${bgColor}`}
                              title={`Day ${i + 1}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-6 mt-4 text-sm flex-wrap">
                  <span>Year of practice: <strong>{completeDays} complete days</strong></span>
                  <span>Longest streak: <strong>{longestStreak} days</strong></span>
                  <span>Current streak: <strong>{currentStreak} days</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* Daily LOVE Practice Card */}
            <Card className="bg-purple-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#6600ff] flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Daily LOVE Practice</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-[#6600ff] hover:bg-[#5500dd]">
                    + Start Today's Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Journal Tab */}
          <TabsContent value="journal" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookText className="h-5 w-5" />
                      Lab Notes
                    </CardTitle>
                    <CardDescription>
                      Your experiment journals and reflections
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {journalsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading your journals...</p>
                  </div>
                ) : !journals || journals.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No journal entries yet.</p>
                    <p className="text-sm text-muted-foreground">
                      Complete experiment lessons and write your reflections to build your Lab Notes!
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {journals.map((journal: NostrEvent) => {
                      const title = journal.tags.find(t => t[0] === 'title')?.[1] || 'Untitled Journal';
                      const date = new Date(journal.created_at * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      return (
                        <AccordionItem key={journal.id} value={journal.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#6600ff]"></div>
                                <span className="font-medium text-left">{title}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">{date}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-5 pr-4 pt-4 space-y-4">
                              <div className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {journal.content}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Magic Mentor Tab */}
          <TabsContent value="mentor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[#6600ff]" />
                  Magic Mentor Training
                </CardTitle>
                <CardDescription>
                  Customize how your AI mentor understands and guides you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* What the mentor knows */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-[#6600ff]" />
                    What Your Mentor Knows About You
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Your Big Dreams (all 11 dimensions)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Experiment progress & completions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Journal entries & reflections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Daily LOVE practice history</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Past conversations with Mentor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Your focus areas & preferences</span>
                    </div>
                  </div>
                </div>

                {/* Custom instructions */}
                <div className="space-y-3">
                  <Label htmlFor="mentor-instructions">
                    Custom Instructions for Your Mentor
                  </Label>
                  <Textarea
                    id="mentor-instructions"
                    placeholder="Tell your Magic Mentor how you'd like to be coached. For example:
- I prefer gentle encouragement over tough love
- Call me by my nickname 'Val'
- Focus on my Money dimension - that's my biggest challenge
- Remind me about my morning routine
- I respond well to metaphors and stories"
                    value={mentorInstructions}
                    onChange={(e) => setMentorInstructions(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    These instructions are encrypted and stored privately. Only you and your AI mentor can access them.
                  </p>
                </div>

                <Button className="bg-[#6600ff] hover:bg-[#5500dd]">
                  <Brain className="h-4 w-4 mr-2" />
                  Save Mentor Training
                </Button>
              </CardContent>
            </Card>

            {/* Chat with Mentor Card */}
            <Card className="border-[#6600ff]/20 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6600ff] to-[#eb00a8] flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">Ready to Chat with Your Mentor?</h3>
                      <p className="text-sm text-muted-foreground">
                        Your AI coach remembers everything and grows with you
                      </p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-gradient-to-r from-[#6600ff] to-[#eb00a8] hover:opacity-90">
                    Start Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Data Tab */}
          <TabsContent value="data" className="space-y-6">
            {/* Data Ownership Explanation */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Shield className="h-5 w-5" />
                  You Own Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-800">
                <p className="mb-4">
                  On Nostr, <strong>you own your identity and data</strong>. Your private key is your identity, 
                  and all your data is encrypted with YOUR key. We can't lock you out, and you can take 
                  your data anywhere.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <Key className="h-5 w-5 mb-2" />
                    <strong>Your Key = Your Identity</strong>
                    <p className="text-green-700">No one can take it away</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <Lock className="h-5 w-5 mb-2" />
                    <strong>Encrypted Data</strong>
                    <p className="text-green-700">Only you can decrypt it</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <Download className="h-5 w-5 mb-2" />
                    <strong>Portable</strong>
                    <p className="text-green-700">Export & take anywhere</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Your Data
                </CardTitle>
                <CardDescription>
                  Download all your data as a JSON file you can import elsewhere
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleExportData} className="h-auto py-4">
                    <div className="text-left">
                      <div className="flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4" />
                        Export All Data (JSON)
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Journals, progress, Big Dreams, everything
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <div className="text-left">
                      <div className="flex items-center gap-2 font-medium">
                        <BookText className="h-4 w-4" />
                        Export Journals Only
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Just your Lab Notes and reflections
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bring Your Own Relay */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Bring Your Own Relay (BYOR)
                </CardTitle>
                <CardDescription>
                  Add your own relay to keep a backup of all your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <strong>Advanced Feature:</strong> If you run your own Nostr relay, you can add it here. 
                      All your private data will be published to your relay in addition to ours, 
                      giving you a complete backup.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-relay">Your Relay URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-relay"
                      placeholder="wss://your-relay.example.com"
                      value={customRelayUrl}
                      onChange={(e) => setCustomRelayUrl(e.target.value)}
                    />
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Add Relay
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your relay must support NIP-42 authentication. Your encrypted data will be synced automatically.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Connected Relays</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <p className="text-sm font-medium">11x LOVE LaB Relay</p>
                          <p className="text-xs text-muted-foreground">wss://nostr-rs-relay-production-1569.up.railway.app</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Primary</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5" />
                    Bookmarks
                  </CardTitle>
                  <CardDescription>Saved posts and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No bookmarks yet
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Assessments
                  </CardTitle>
                  <CardDescription>Your completed assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No assessments yet
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Music & Meditations
                  </CardTitle>
                  <CardDescription>Audio resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Coming soon
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Library className="h-5 w-5" />
                    Reading List
                  </CardTitle>
                  <CardDescription>Books and articles</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Vault;
