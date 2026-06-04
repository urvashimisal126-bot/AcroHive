import React, { useState } from 'react';
import { Calendar, Search, MapPin, Users, Filter, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  capacity: number;
  registered: number;
  status: 'Open' | 'Closed' | 'Upcoming';
  image: string;
}

const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Hack-a-Thon 2026',
    date: '2026-08-15 09:00 AM',
    venue: 'Main Auditorium',
    capacity: 500,
    registered: 350,
    status: 'Open',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'evt-2',
    title: 'AI/ML Bootcamp',
    date: '2026-06-06 10:00 AM',
    venue: 'Lab 4',
    capacity: 60,
    registered: 60,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'evt-3',
    title: 'Cyber Security Summit',
    date: '2026-09-10 11:00 AM',
    venue: 'Conference Hall B',
    capacity: 200,
    registered: 45,
    status: 'Open',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'evt-4',
    title: 'Cloud Native Workshop',
    date: '2026-10-05 01:00 PM',
    venue: 'Virtual',
    capacity: 1000,
    registered: 800,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  },
];

export default function EventsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Open' | 'Upcoming'>('All');

  const filteredEvents = MOCK_EVENTS.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All' || e.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20">
      {/* Header section */}
      <div className="border-b border-primary/10 bg-[#0a0f1a] pt-12 pb-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Calendar className="text-primary w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Events Directory</h1>
          </div>
          <p className="text-gray-400 text-sm max-w-xl">
            Browse and register for all upcoming campus events. Access tickets, find venues, and participate in academic and extracurricular activities.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#0d1a2e] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-primary outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['All', 'Open', 'Upcoming'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-primary text-black shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                    : 'bg-[#0d1a2e] text-gray-400 border border-gray-800 hover:border-primary/50'
                }`}
              >
                {f === 'All' ? <Filter className="w-4 h-4 inline-block mr-1.5" /> : null}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-[#0d1a2e] border border-primary/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-colors group">
              <div className="h-40 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a2e] to-transparent z-10" />
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 right-3 z-20">
                  {event.status === 'Open' && <span className="bg-primary/20 text-primary border border-primary/40 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono shadow-[0_0_10px_rgba(0,212,255,0.2)]">OPEN</span>}
                  {event.status === 'Upcoming' && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono">UPCOMING</span>}
                  {event.status === 'Closed' && <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono">CLOSED</span>}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4 text-primary" /> {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-primary" /> {event.venue}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4 text-primary" /> {event.registered} / {event.capacity} Spots
                  </div>
                </div>
                
                {event.status === 'Open' ? (
                  <button className="w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/30 rounded-lg font-semibold text-sm transition-all text-center group-hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                    Register Now
                  </button>
                ) : (
                  <button disabled className="w-full py-2.5 bg-gray-800/50 text-gray-500 border border-gray-800 rounded-lg font-semibold text-sm cursor-not-allowed">
                    {event.status === 'Upcoming' ? 'Coming Soon' : 'Registration Closed'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-500">No events found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
