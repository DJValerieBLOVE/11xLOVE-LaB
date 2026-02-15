import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Palette, Bell, Shield, Database, Zap, Loader2, Sun, Moon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RelayListManager } from '@/components/RelayListManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const Settings = () => {
  const queryClient = useQueryClient();
  const currentUserData = useCurrentUser();
  const { user, metadata } = currentUserData;
  const { theme, setTheme } = useTheme();
  const { mutateAsync: publishEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();
  
  // Lightning wallet state
  const [lud16, setLud16] = useState('');

  useSeoMeta({
    title: 'Settings - 11x LOVE LaB',
    description: 'Manage your account settings and preferences',
  });

  // Initialize lud16 from metadata
  useEffect(() => {
    if (metadata?.lud16) {
      setLud16(metadata.lud16);
    }
  }, [metadata]);

  const handleSaveLightning = async () => {
    if (!user) return;

    try {
      const data = { ...metadata, lud16 };
      
      // Clean up empty values
      for (const key in data) {
        if (data[key] === '') {
          delete data[key];
        }
      }

      await publishEvent({
        kind: 0,
        content: JSON.stringify(data),
      });

      queryClient.invalidateQueries({ queryKey: ['logins'] });
      queryClient.invalidateQueries({ queryKey: ['author', user.pubkey] });

      toast({
        title: 'Success',
        description: 'Lightning wallet address saved',
      });
    } catch (error) {
      console.error('Failed to save lightning address:', error);
      toast({
        title: 'Error',
        description: 'Failed to save lightning address. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
                  Please log in to access settings.
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
      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and configurations
          </p>
        </div>

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto mb-6">
            <TabsTrigger value="wallet" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Zap className="h-4 w-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="relays" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Database className="h-4 w-4 mr-2" />
              Relays
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lightning Wallet</CardTitle>
                <CardDescription>
                  Configure your Lightning address to receive zaps (Bitcoin tips)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lud16">Lightning Address</Label>
                  <Input
                    id="lud16"
                    type="text"
                    placeholder="you@getalby.com"
                    value={lud16}
                    onChange={(e) => setLud16(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Your Lightning address (similar to email format). Get one from{' '}
                    <a
                      href="https://getalby.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6600ff] hover:underline"
                    >
                      Alby
                    </a>
                    ,{' '}
                    <a
                      href="https://wallet.mutinywallet.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6600ff] hover:underline"
                    >
                      Mutiny
                    </a>
                    , or other Lightning wallets.
                  </p>
                </div>
                <Button
                  onClick={handleSaveLightning}
                  disabled={isPublishing}
                  className="bg-[#6600ff] hover:bg-[#5500dd]"
                >
                  {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Lightning Address
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Choose your preferred color theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark')}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Sun className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Light</div>
                        <div className="text-sm text-muted-foreground">Bright and clean interface</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Moon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Dark</div>
                        <div className="text-sm text-muted-foreground">Easy on the eyes in low light</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relays Tab */}
          <TabsContent value="relays" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relay Configuration</CardTitle>
                <CardDescription>
                  Manage your Nostr relay connections. Your Railway relay is always active for LaB data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RelayListManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Coming soon!</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage your notification preferences.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Coming soon!</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage your privacy settings and data encryption.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
