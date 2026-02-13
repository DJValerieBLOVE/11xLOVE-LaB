import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Calendar, Clock, Users } from 'lucide-react';
import { events } from '@/data/events';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Events = () => {
  const { user } = useCurrentUser();

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

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="mb-2">Events</h1>
        <p className="text-muted-foreground mb-8">
          Live workshops, community calls, and special gatherings
        </p>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
              {/* Colored Header */}
              <div className={`h-24 bg-gradient-to-br ${event.color} flex items-center justify-center px-6`}>
                <h3 className="text-white text-xl font-bold text-center">
                  {event.title}
                </h3>
              </div>

              <CardHeader className="pb-3">
                {/* Event Type Badge */}
                <Badge variant="secondary" className="w-fit mb-2">
                  {event.type}
                </Badge>

                <CardDescription className="text-base">
                  {event.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{event.time}</span>
                  </div>
                </div>

                {/* Duration and Attendees */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{event.duration}</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.attendees}
                      {event.maxAttendees && ` / ${event.maxAttendees}`}
                    </span>
                  </div>
                </div>

                {/* Host */}
                <div className="text-sm">
                  <span className="text-muted-foreground">Hosted by </span>
                  <span className="font-medium">{event.host}</span>
                </div>

                {/* Register Button */}
                <Button className="w-full" size="lg">
                  Register
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Events;
