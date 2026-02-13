export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  host: string;
  attendees: number;
  maxAttendees?: number;
  type: 'Workshop' | 'Community Call' | 'Ceremony' | 'Masterclass';
  color: string;
  status: 'upcoming' | 'live' | 'past';
}

export const events: Event[] = [
  {
    id: 'full-moon-ceremony',
    title: 'Full Moon Ceremony',
    description: 'Join us for a powerful full moon manifestation ceremony',
    date: 'Nov 30',
    time: '7:00 PM EST',
    duration: '90 min',
    host: 'DJ Valerie B LOVE',
    attendees: 42,
    maxAttendees: 100,
    type: 'Ceremony',
    color: 'from-purple-500 to-indigo-500',
    status: 'upcoming',
  },
  {
    id: 'bitcoin-workshop',
    title: 'Bitcoin Security Workshop',
    description: 'Learn best practices for securing your Bitcoin',
    date: 'Feb 15',
    time: '2:00 PM EST',
    duration: '2 hours',
    host: 'Bitcoin Expert',
    attendees: 67,
    maxAttendees: 50,
    type: 'Workshop',
    color: 'from-orange-500 to-orange-600',
    status: 'upcoming',
  },
  {
    id: 'community-call-feb',
    title: 'February Community Call',
    description: 'Monthly check-in and Q&A with the entire Tribe',
    date: 'Feb 20',
    time: '6:00 PM EST',
    duration: '60 min',
    host: 'DJ Valerie B LOVE',
    attendees: 128,
    type: 'Community Call',
    color: 'from-pink-500 to-purple-500',
    status: 'upcoming',
  },
  {
    id: 'lightning-masterclass',
    title: 'Lightning Network Masterclass',
    description: 'Deep dive into Lightning Network development',
    date: 'Feb 25',
    time: '1:00 PM EST',
    duration: '3 hours',
    host: 'Lightning Labs',
    attendees: 34,
    maxAttendees: 30,
    type: 'Masterclass',
    color: 'from-blue-500 to-cyan-500',
    status: 'upcoming',
  },
  {
    id: 'new-moon-intention',
    title: 'New Moon Intention Setting',
    description: 'Set powerful intentions for the upcoming lunar cycle',
    date: 'Mar 1',
    time: '8:00 PM EST',
    duration: '75 min',
    host: 'DJ Valerie B LOVE',
    attendees: 56,
    maxAttendees: 100,
    type: 'Ceremony',
    color: 'from-indigo-500 to-purple-500',
    status: 'upcoming',
  },
];
