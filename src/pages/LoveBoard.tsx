/**
 * Love Board Page
 * 
 * Community bulletin board for jobs, services, and support.
 * PAID MEMBERS ONLY can post listings.
 */

import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMembership } from '@/hooks/useMembership';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lock, 
  Briefcase, 
  Wrench, 
  ShoppingBag, 
  HandHelping, 
  Plus,
  Crown,
  Sparkles,
  MapPin,
  Zap,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoginArea } from '@/components/auth/LoginArea';
import { CardImage } from '@/components/ui/card-image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock listings for demo
const mockListings = [
  {
    id: '1',
    type: 'services',
    title: 'Bitcoin Consulting & Setup',
    description: 'Help you get started with Bitcoin, set up a wallet, and understand self-custody. 1-hour session.',
    author: 'Alex Luna',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    location: 'Remote',
    price: '50,000 sats',
    createdAt: '2 days ago',
  },
  {
    id: '2',
    type: 'jobs',
    title: 'Looking for Nostr Developer',
    description: 'Building a new Nostr client. Need someone with React and TypeScript experience.',
    author: 'Jordan Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    location: 'Remote',
    price: 'Negotiable',
    createdAt: '1 week ago',
  },
  {
    id: '3',
    type: 'help',
    title: 'Need Accountability Partner for Morning Routine',
    description: 'Looking for someone to check in with daily at 6am. Prefer someone in Pacific time zone.',
    author: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    location: 'Pacific Time',
    price: 'Free (V4V)',
    createdAt: '3 days ago',
  },
];

const LoveBoard = () => {
  const { user, metadata } = useCurrentUser();
  const { isPaidMember, tierInfo } = useMembership();
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useSeoMeta({
    title: 'Love Board - 11x LOVE LaB',
    description: 'Community bulletin board for jobs, services, and support',
  });

  // Filter listings by type
  const filteredListings = activeTab === 'all' 
    ? mockListings 
    : mockListings.filter(l => l.type === activeTab);

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto text-[#eb00a8] mb-4" />
              <h1 className="text-3xl font-bold mb-4">Love Board</h1>
              <p className="text-muted-foreground mb-6">
                Community bulletin board for jobs, services, and mutual support.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Login Required</CardTitle>
                </div>
                <CardDescription>
                  Log in to browse and post listings
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="mb-2">Love Board</h1>
            <p className="text-muted-foreground">
              Community bulletin board for opportunities and support
            </p>
          </div>
          
          {/* Create Listing Button - Paid Members Only */}
          {isPaidMember ? (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-[#eb00a8] hover:bg-[#d10098]">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Listing</DialogTitle>
                  <DialogDescription>
                    Share a job, service, or request with the community
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-center text-muted-foreground">
                  <p>Listing form coming soon!</p>
                  <p className="text-sm mt-2">You'll be able to post jobs, services, items for sale, and help requests.</p>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="lg"
                className="border-dashed"
                disabled
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Members Only
              </Badge>
            </div>
          )}
        </div>

        {/* Membership Notice for Free Users */}
        {!isPaidMember && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    Upgrade to post listings
                  </p>
                  <p className="text-sm text-amber-700">
                    Paid members can post jobs, services, and help requests to the Love Board.
                  </p>
                </div>
                <Button size="sm" className="ml-auto bg-amber-600 hover:bg-amber-700">
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto mb-6 flex-wrap">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#eb00a8] data-[state=active]:text-[#eb00a8]"
            >
              All Listings
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#eb00a8] data-[state=active]:text-[#eb00a8]"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Job Offers
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#eb00a8] data-[state=active]:text-[#eb00a8]"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger 
              value="for-sale" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#eb00a8] data-[state=active]:text-[#eb00a8]"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              For Sale
            </TabsTrigger>
            <TabsTrigger 
              value="help" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#eb00a8] data-[state=active]:text-[#eb00a8]"
            >
              <HandHelping className="h-4 w-4 mr-2" />
              Help Wanted
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredListings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No listings in this category yet.
                  </p>
                  {isPaidMember && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      Be the first to post!
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-all">
                    {/* 16:9 Image placeholder */}
                    <CardImage
                      alt={listing.title}
                      fallbackText={listing.title}
                      fallbackGradient={
                        listing.type === 'jobs' ? 'from-blue-500 to-blue-600' :
                        listing.type === 'services' ? 'from-green-500 to-green-600' :
                        listing.type === 'help' ? 'from-purple-500 to-purple-600' :
                        'from-orange-500 to-orange-600'
                      }
                    />
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {listing.type === 'jobs' && <Briefcase className="h-3 w-3 mr-1" />}
                          {listing.type === 'services' && <Wrench className="h-3 w-3 mr-1" />}
                          {listing.type === 'help' && <HandHelping className="h-3 w-3 mr-1" />}
                          {listing.type === 'for-sale' && <ShoppingBag className="h-3 w-3 mr-1" />}
                          {listing.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{listing.createdAt}</span>
                      </div>
                      <CardTitle className="text-lg mt-2">{listing.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {listing.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Author */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={listing.avatar} />
                          <AvatarFallback>{listing.author.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{listing.author}</span>
                      </div>
                      
                      {/* Details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {listing.price}
                        </span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" className="flex-1 bg-[#eb00a8] hover:bg-[#d10098]">
                          <Zap className="h-4 w-4 mr-1" />
                          Zap
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LoveBoard;
