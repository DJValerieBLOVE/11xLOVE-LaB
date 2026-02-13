import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Clock, Users, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { events } from '@/data/events';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

const Events = () => {
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [date, setDate] = useState<Date | undefined>(new Date());

  useSeoMeta({
    title: 'Events - 11x LOVE LaB',
    description: 'Join live events, workshops, and community gatherings.',
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
                  Please log in to view upcoming events.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">Meetings & Gatherings</h1>
            <p className="text-muted-foreground">
              Connect with the community in real-time
            </p>
          </div>
          <Button size="lg">
            + Create Event
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto">
            <TabsTrigger 
              value="upcoming" 
              className="rounded-full data-[state=active]:bg-[#6600ff] data-[state=active]:text-white"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="nearby" className="rounded-full">
              Nearby
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-full">
              Past
            </TabsTrigger>
            <TabsTrigger value="yours" className="rounded-full">
              Yours
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Input
              type="search"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12"
            />

            {/* Event Cards */}
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all duration-200">
                  <div className="flex gap-4 p-6">
                    {/* Event Image/Color Block */}
                    <div className={`w-32 h-32 rounded-lg bg-gradient-to-br ${event.color} flex-shrink-0 flex items-center justify-center`}>
                      <span className="text-xs font-semibold text-white px-2 py-1 bg-black/20 rounded">
                        TODAY
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                            <span>{event.time}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5 text-gray-400" />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>+{event.attendees} going</span>
                        </div>
                        <Button size="lg">
                          RSVP
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Calendar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">February 2026</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
                <Button className="w-full mt-4">
                  Today
                </Button>
              </CardContent>
            </Card>

            {/* Host an Event Card */}
            <Card className="bg-purple-50">
              <CardHeader>
                <CardTitle>Host an Event?</CardTitle>
                <CardDescription>
                  Community members can host their own gatherings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Events;
