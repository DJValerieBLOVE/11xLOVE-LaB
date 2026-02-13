import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Briefcase, Wrench, ShoppingBag, HandHelping } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const LoveBoard = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Love Board - 11x LOVE LaB',
    description: 'Community bulletin board for jobs, services, and support',
  });

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
                  Please log in to access the Love Board.
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">Love Board</h1>
            <p className="text-muted-foreground">
              Community bulletin board for opportunities and support
            </p>
          </div>
          <Button size="lg">
            + Create Listing
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto mb-6">
            <TabsTrigger value="all" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              All Listings
            </TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Briefcase className="h-4 w-4 mr-2" />
              Job Offers
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <Wrench className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="for-sale" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <ShoppingBag className="h-4 w-4 mr-2" />
              For Sale
            </TabsTrigger>
            <TabsTrigger value="help" className="rounded-none border-b-2 data-[state=active]:border-[#6600ff] data-[state=active]:text-[#6600ff]">
              <HandHelping className="h-4 w-4 mr-2" />
              Help Wanted
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Community Listings</CardTitle>
                <CardDescription>
                  Browse opportunities and offerings from the Tribe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  No listings yet. Be the first to post!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  No job offers posted yet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  No services listed yet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="for-sale">
            <Card>
              <CardHeader>
                <CardTitle>Items For Sale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  No items for sale yet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Help Wanted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  No help requests posted yet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LoveBoard;