import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Shield, Users, Calendar, Activity, CheckCircle,
  X, Download, ShieldAlert, Search, ChevronRight,
  Wifi, MapPin, Award, Clock, BarChart2, QrCode,
  Lock, Unlock, Cpu, RefreshCw,
} from 'lucide-react';

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// TYPES
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
interface Event {
  id: string;
  title: string;
  date: string;
  venue_name: string;
  registered: number;
  capacity: number;
  attendanceOpen: boolean;
  demoMode: boolean;
  past: boolean;
  checkedIn: number;
}

interface ActivityEntry {
  id: string;
  type: 'registration' | 'checkin';
  studentName: string;
  eventTitle: string;
  method?: string;
  timestamp: Date;
}

interface Attendee {
  id: string;
  name: string;
  rollNumber: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  method?: string;
  isNew?: boolean;
}

interface Certificate {
  id: string;
  studentName: string;
  rollNumber: string;
  eventTitle: string;
  date: string;
  uniqueCode: string;
  quote?: string;
}

interface StudentRegistration {
  id: string;
  eventTitle: string;
  date: string;
  venue: string;
  seatStatus: 'Confirmed' | 'Waitlisted';
  checkedIn: boolean;
  checkedInAt?: string;
  isNew?: boolean;
}

interface TimelineEntry {
  id: string;
  type: 'registration' | 'checkin';
  eventTitle: string;
  date: string;
  method?: string;
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// MOCK AUTH  ΓÇö replace with your real auth hook
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const useAuth = () => ({
  user: { id: 'mock-admin-id', email: 'admin@aitr.ac.in', name: 'Dr. Admin' },
  role: 'admin' as 'admin' | 'student', // toggle to 'student' to test student view
});

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// SEED DATA
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const SEED_EVENTS: Event[] = [
  { id: '1', title: 'AI & ML Workshop', date: '2026-06-10', venue_name: 'Seminar Hall A', registered: 45, capacity: 50, attendanceOpen: true, demoMode: false, past: false, checkedIn: 38 },
  { id: '2', title: 'Hackathon Kickoff', date: '2026-06-12', venue_name: 'Main Auditorium', registered: 120, capacity: 200, attendanceOpen: false, demoMode: false, past: false, checkedIn: 0 },
  { id: '3', title: 'Web3 Bootcamp', date: '2026-05-20', venue_name: 'Tech Lab 3', registered: 60, capacity: 60, attendanceOpen: false, demoMode: false, past: true, checkedIn: 52 },
  { id: '4', title: 'Cloud Computing 101', date: '2026-05-10', venue_name: 'Room 301', registered: 30, capacity: 40, attendanceOpen: false, demoMode: false, past: true, checkedIn: 25 },
];

const SEED_ATTENDEES: Attendee[] = [
  { id: 'a1', name: 'Priya Sharma', rollNumber: '0832CS21001', registeredAt: '2026-06-08T10:22:00Z', checkedIn: true, checkedInAt: '2026-06-10T09:15:00Z', method: 'GPS' },
  { id: 'a2', name: 'Rahul Verma', rollNumber: '0832CS21002', registeredAt: '2026-06-08T11:05:00Z', checkedIn: false },
  { id: 'a3', name: 'Sneha Patel', rollNumber: '0832AI21003', registeredAt: '2026-06-09T08:30:00Z', checkedIn: true, checkedInAt: '2026-06-10T09:21:00Z', method: 'Network' },
  { id: 'a4', name: 'Arjun Singh', rollNumber: '0832CS21004', registeredAt: '2026-06-09T14:00:00Z', checkedIn: false },
  { id: 'a5', name: 'Divya Rao', rollNumber: '0832AI21005', registeredAt: '2026-06-07T09:00:00Z', checkedIn: true, checkedInAt: '2026-06-10T09:30:00Z', method: 'GPS' },
];

const SEED_STUDENT_REGS: StudentRegistration[] = [
  { id: 'r1', eventTitle: 'AI & ML Workshop', date: '2026-06-10', venue: 'Seminar Hall A', seatStatus: 'Confirmed', checkedIn: false },
  { id: 'r2', eventTitle: 'Web3 Bootcamp', date: '2026-05-20', venue: 'Tech Lab 3', seatStatus: 'Confirmed', checkedIn: true, checkedInAt: '2026-05-20T09:30:00Z' },
  { id: 'r3', eventTitle: 'Cloud Computing 101', date: '2026-05-10', venue: 'Room 301', seatStatus: 'Confirmed', checkedIn: true, checkedInAt: '2026-05-10T10:00:00Z' },
  { id: 'r4', eventTitle: 'Hackathon Kickoff', date: '2026-06-12', venue: 'Main Auditorium', seatStatus: 'Waitlisted', checkedIn: false },
];

const SEED_TIMELINE: TimelineEntry[] = [
  { id: 't1', type: 'registration', eventTitle: 'AI & ML Workshop', date: '2026-06-08' },
  { id: 't2', type: 'registration', eventTitle: 'Hackathon Kickoff', date: '2026-06-08' },
  { id: 't3', type: 'checkin', eventTitle: 'Web3 Bootcamp', date: '2026-05-20', method: 'GPS' },
  { id: 't4', type: 'registration', eventTitle: 'Web3 Bootcamp', date: '2026-05-15' },
  { id: 't5', type: 'checkin', eventTitle: 'Cloud Computing 101', date: '2026-05-10', method: 'Network' },
  { id: 't6', type: 'registration', eventTitle: 'Cloud Computing 101', date: '2026-05-08' },
];

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// HELPERS
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour12: false });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generateUniqueCode(eventTitle: string, roll: string): string {
  const shortcode = eventTitle.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
  const hash = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ACRO-${shortcode}-${roll.slice(-4)}-${hash}`;
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// INLINE CSS ANIMATIONS
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const ANIMATION_STYLE = `
  @keyframes slideDown {
    from { transform: translateY(-8px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes pulseGlow {
    0%, 100% { text-shadow: none; color: #fff; }
    50%       { text-shadow: 0 0 20px rgba(0,212,255,0.9); color: #00D4FF; }
  }
  @keyframes drawerIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  @keyframes rowFadeIn {
    from { background-color: rgba(0,212,255,0.12); opacity: 0.6; }
    to   { background-color: transparent;           opacity: 1; }
  }
  .anim-slide-down   { animation: slideDown 300ms ease forwards; }
  .anim-pulse-glow   { animation: pulseGlow 300ms ease; }
  .anim-drawer-in    { animation: drawerIn 300ms cubic-bezier(.4,0,.2,1) forwards; }
  .anim-row-fade     { animation: rowFadeIn 800ms ease forwards; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// ROOT PAGE
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function CommandCenter() {
  const { user, role } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Redirecting to loginΓÇª</p>
      </div>
    );
  }

  return (
    <>
      <style>{ANIMATION_STYLE}</style>
      <div className="min-h-screen bg-black text-white font-sans">
        {role === 'admin'
          ? <AdminDashboard userId={user.id} />
          : <StudentDashboard userId={user.id} />}
      </div>
    </>
  );
}

// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
// ADMIN DASHBOARD
// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
function AdminDashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'certificates'>('overview');
  const [metrics, setMetrics] = useState({ totalEvents: 0, myEvents: 0, totalRegistrations: 0, attendanceRate: 'ΓÇö' });
  const [pulsingMetric, setPulsingMetric] = useState(false);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // ΓöÇΓöÇ Load initial data ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  useEffect(() => {
    setEvents(SEED_EVENTS);
    computeMetrics(SEED_EVENTS);
  }, []);

  // ΓöÇΓöÇ Supabase Realtime ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  useEffect(() => {
    const channel = supabase
      .channel('admin-command-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'registrations' }, (payload) => {
        const row = payload.new as any;
        pushActivity({
          id: crypto.randomUUID(),
          type: 'registration',
          studentName: row.student_name ?? 'Unknown',
          eventTitle: row.event_title ?? 'Event',
          timestamp: new Date(),
        });
        triggerPulse();
        reloadMetrics();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, (payload) => {
        const row = payload.new as any;
        pushActivity({
          id: crypto.randomUUID(),
          type: 'checkin',
          studentName: row.student_name ?? 'Unknown',
          eventTitle: row.event_title ?? 'Event',
          method: row.verification_method ?? 'GPS',
          timestamp: new Date(),
        });
        triggerPulse();
        reloadMetrics();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const pushActivity = useCallback((entry: ActivityEntry) => {
    setActivities(prev => [entry, ...prev].slice(0, 20));
    setLastActivity(new Date());
  }, []);

  const triggerPulse = () => {
    setPulsingMetric(true);
    setTimeout(() => setPulsingMetric(false), 300);
  };

  const computeMetrics = (evts: Event[]) => {
    const total = evts.length;
    const totalReg = evts.reduce((s, e) => s + e.registered, 0);
    const totalChecked = evts.reduce((s, e) => s + e.checkedIn, 0);
    const rate = totalReg > 0 ? Math.round((totalChecked / totalReg) * 100) + '%' : '0%';
    setMetrics({ totalEvents: total, myEvents: total, totalRegistrations: totalReg, attendanceRate: rate });
  };

  const reloadMetrics = () => {
    // In production: re-query Supabase. For now re-derive from state.
    setEvents(prev => { computeMetrics(prev); return prev; });
  };

  const toggleAttendance = async (id: string, current: boolean) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, attendanceOpen: !current } : e));
    // await supabase.from('events').update({ attendance_open: !current }).eq('id', id);
  };

  const toggleDemoMode = async (id: string, current: boolean) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, demoMode: !current } : e));
    // await supabase.from('events').update({ demo_mode: !current }).eq('id', id);
  };

  const TABS = ['overview', 'events', 'certificates'] as const;

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-10 space-y-8">
      {/* ΓöÇΓöÇ Header ΓöÇΓöÇ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="text-cyan-400" size={28} />
            <span>Command Center</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Manage events, monitor live registrations, generate certificates.</p>
        </div>
        <div className="flex bg-[#0d1a2e] border border-cyan-400/20 rounded-lg p-1 self-start">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                  : 'text-gray-400 hover:text-cyan-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ΓöÇΓöÇ Overview Tab ΓöÇΓöÇ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total Events"         value={metrics.totalEvents}         icon={<Calendar size={20}/>}   pulse={pulsingMetric} />
            <MetricCard title="My Events"            value={metrics.myEvents}            icon={<BarChart2 size={20}/>}  pulse={pulsingMetric} />
            <MetricCard title="Total Registrations"  value={metrics.totalRegistrations}  icon={<Users size={20}/>}      pulse={pulsingMetric} />
            <MetricCard title="Attendance Rate"      value={metrics.attendanceRate}      icon={<CheckCircle size={20}/>} pulse={pulsingMetric} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seat Utilization */}
            <div className="lg:col-span-2 bg-[#0d1a2e] border border-cyan-400/20 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                <BarChart2 size={16} className="text-cyan-400" /> Seat Utilization
              </h3>
              {events.map(e => {
                const pct = e.capacity > 0 ? Math.round((e.registered / e.capacity) * 100) : 0;
                return (
                  <div key={e.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-200 truncate max-w-[200px]">{e.title}</span>
                      <span className="text-cyan-400 font-mono text-xs">
                        {pct}% &nbsp;({e.registered}/{e.capacity})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#0d0d0d] rounded-full overflow-hidden border border-gray-800">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, boxShadow: '0 0 8px rgba(0,212,255,0.5)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Activity Stream */}
            <LiveActivityStream activities={activities} lastActivity={lastActivity} />
          </div>
        </div>
      )}

      {/* ΓöÇΓöÇ Events Tab ΓöÇΓöÇ */}
      {activeTab === 'events' && (
        <EventsTable
          events={events}
          onToggleAttendance={toggleAttendance}
          onToggleDemoMode={toggleDemoMode}
          onOpenAttendees={setSelectedEvent}
        />
      )}

      {/* ΓöÇΓöÇ Certificates Tab ΓöÇΓöÇ */}
      {activeTab === 'certificates' && (
        <CertificatesTab events={events.filter(e => e.past && e.checkedIn > 0)} />
      )}

      {/* ΓöÇΓöÇ Attendee Drawer ΓöÇΓöÇ */}
      {selectedEvent && (
        <AttendeeDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// METRIC CARD
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function MetricCard({ title, value, icon, pulse }: {
  title: string; value: string | number; icon: React.ReactNode; pulse: boolean;
}) {
  return (
    <div className="bg-[#0d1a2e] border border-cyan-400/20 rounded-xl p-5 relative overflow-hidden group hover:border-cyan-400/50 transition-all">
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
      <p className={`text-3xl font-bold transition-all ${pulse ? 'anim-pulse-glow' : 'text-white'}`}>
        {value}
      </p>
      <div className="absolute right-4 top-4 text-cyan-400/25 group-hover:text-cyan-400/60 transition-colors">
        {icon}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// LIVE ACTIVITY STREAM
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function LiveActivityStream({ activities, lastActivity }: { activities: ActivityEntry[]; lastActivity: Date }) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIdle(true), 30_000);
    setIdle(false);
    return () => clearTimeout(timer);
  }, [lastActivity]);

  return (
    <div className="bg-[#0d1a2e] border border-cyan-400/20 rounded-xl p-6 flex flex-col max-h-[420px]">
      <h3 className="text-base font-bold flex items-center gap-2 mb-4 shrink-0">
        <Activity size={16} className="text-cyan-400 animate-pulse" />
        Live Activity Stream
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
        {activities.length === 0 || idle ? (
          <p className="text-gray-500 text-sm text-center mt-6 animate-pulse">ΓùÅ Listening for eventsΓÇª</p>
        ) : (
          activities.map((act, i) => (
            <div
              key={act.id}
              className="anim-slide-down text-sm p-3 bg-black/50 rounded-lg border border-gray-800/60 flex justify-between items-start gap-2"
              style={{ animationDelay: i === 0 ? '0ms' : undefined }}
            >
              <span className="text-gray-200 leading-snug">
                {act.type === 'registration'
                  ? `≡ƒæñ ${act.studentName} registered for ${act.eventTitle}`
                  : `Γ£à ${act.studentName} checked in to ${act.eventTitle} ΓÇó ${act.method}`}
              </span>
              <span className="text-xs text-gray-500 font-mono whitespace-nowrap shrink-0">{formatTime(act.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// EVENTS TABLE
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function EventsTable({ events, onToggleAttendance, onToggleDemoMode, onOpenAttendees }: {
  events: Event[];
  onToggleAttendance: (id: string, current: boolean) => void;
  onToggleDemoMode: (id: string, current: boolean) => void;
  onOpenAttendees: (event: Event) => void;
}) {
  const getStatus = (e: Event) => {
    if (e.past) return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-500 font-mono">CLOSED</span>;
    if (e.attendanceOpen) return <span className="px-2 py-0.5 text-xs rounded-full border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 font-mono animate-pulse">OPEN</span>;
    return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800/60 text-gray-300 font-mono">SCHEDULED</span>;
  };

  return (
    <div className="bg-[#0d1a2e] border border-cyan-400/20 rounded-xl p-6 overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
            <th className="pb-3 pr-4 font-medium">Event Name</th>
            <th className="pb-3 pr-4 font-medium">Date</th>
            <th className="pb-3 pr-4 font-medium">Registered</th>
            <th className="pb-3 pr-4 font-medium">Capacity</th>
            <th className="pb-3 pr-4 font-medium">Att. %</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => {
            const attPct = e.registered > 0 ? Math.round((e.checkedIn / e.registered) * 100) : 0;
            return (
              <tr key={e.id} className="border-b border-gray-800/40 hover:bg-white/3 transition-colors">
                <td className="py-4 pr-4 font-medium text-white">{e.title}</td>
                <td className="py-4 pr-4 text-gray-400 text-sm font-mono">{e.date}</td>
                <td className="py-4 pr-4 text-sm">{e.registered}</td>
                <td className="py-4 pr-4 text-sm text-gray-400">{e.capacity}</td>
                <td className="py-4 pr-4 text-sm text-cyan-400 font-mono">{attPct}%</td>
                <td className="py-4 pr-4">{getStatus(e)}</td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {/* Attendees */}
                    <button
                      onClick={() => onOpenAttendees(e)}
                      title="View Attendees"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-700 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                    >
                      <Users size={12} /> Attendees
                    </button>

                    {/* Open/Close Window */}
                    {!e.past && (
                      <button
                        onClick={() => onToggleAttendance(e.id, e.attendanceOpen)}
                        title={e.attendanceOpen ? 'Close Attendance Window' : 'Open Attendance Window'}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          e.attendanceOpen
                            ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                            : 'border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10'
                        }`}
                      >
                        {e.attendanceOpen ? <><Lock size={12}/> Close</> : <><Unlock size={12}/> Open</>}
                      </button>
                    )}

                    {/* Demo Mode */}
                    {!e.past && (
                      <button
                        onClick={() => onToggleDemoMode(e.id, e.demoMode)}
                        title="Toggle Demo Mode (Bypass Geofence)"
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          e.demoMode
                            ? 'border-amber-500/60 text-amber-400 bg-amber-500/10'
                            : 'border-gray-700 text-gray-500 hover:border-amber-500/60 hover:text-amber-400'
                        }`}
                      >
                        <ShieldAlert size={12} /> Demo
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// ATTENDEE DRAWER
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function AttendeeDrawer({ event, onClose }: { event: Event; onClose: () => void }) {
  const [attendees, setAttendees] = useState<Attendee[]>(SEED_ATTENDEES);
  const [query, setQuery] = useState('');

  // Realtime subscription for this event
  useEffect(() => {
    const channel = supabase
      .channel(`attendees-${event.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance', filter: `event_id=eq.${event.id}` }, (payload) => {
        const row = payload.new as any;
        setAttendees(prev => {
          const updated = prev.map(a =>
            a.id === row.registration_id
              ? { ...a, checkedIn: true, checkedInAt: row.checked_in_at, method: row.verification_method, isNew: true }
              : a
          );
          return updated;
        });
        setTimeout(() => setAttendees(prev => prev.map(a => ({ ...a, isNew: false }))), 900);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [event.id]);

  const filtered = attendees.filter(a =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.rollNumber.toLowerCase().includes(query.toLowerCase())
  );

  const exportCSV = () => {
    const header = ['Name', 'Roll Number', 'Registered At', 'Checked In', 'Time', 'Method'];
    const rows = attendees.map(a => [
      a.name, a.rollNumber, formatDate(a.registeredAt),
      a.checkedIn ? 'Yes' : 'No',
      a.checkedInAt ? formatDate(a.checkedInAt) : 'ΓÇö',
      a.method ?? 'ΓÇö',
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/ /g, '_')}_attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        className="anim-drawer-in w-full max-w-2xl bg-[#0a0f1a] border-l border-cyan-400/20 flex flex-col h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold">{event.title} ΓÇö Attendees</h2>
            <p className="text-gray-400 text-sm mt-0.5">{attendees.filter(a => a.checkedIn).length} checked in of {attendees.length} registered</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or roll numberΓÇª"
              className="w-full bg-black border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-cyan-400 outline-none placeholder-gray-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#0a0f1a]">
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Roll No</th>
                <th className="px-6 py-3 font-medium">Registered</th>
                <th className="px-6 py-3 font-medium">Checked In</th>
                <th className="px-6 py-3 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr
                  key={a.id}
                  className={`border-b border-gray-800/40 hover:bg-white/3 transition-colors ${a.isNew ? 'anim-row-fade' : ''}`}
                >
                  <td className="px-6 py-3.5 font-medium text-white">{a.name}</td>
                  <td className="px-6 py-3.5 text-gray-400 font-mono text-xs">{a.rollNumber}</td>
                  <td className="px-6 py-3.5 text-gray-400 text-xs">{formatDate(a.registeredAt)}</td>
                  <td className="px-6 py-3.5">
                    {a.checkedIn ? (
                      <span className="text-green-400 font-mono text-xs">Γ£à {a.checkedInAt ? formatDate(a.checkedInAt) : 'ΓÇö'}</span>
                    ) : (
                      <span className="text-gray-500 text-xs">ΓÅ│ Not yet</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    {a.method ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-mono">{a.method}</span>
                    ) : (
                      <span className="text-gray-600 text-xs">ΓÇö</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">No attendees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// CERTIFICATES TAB
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function CertificatesTab({ events }: { events: Event[] }) {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [certs, setCerts] = useState<Certificate[]>([]);

  const generateCerts = async () => {
    if (!selectedEventId) return;
    setGenerating(true);
    setCerts([]);
    
    try {
      const ev = events.find(e => e.id === selectedEventId)!;
      const attendees = SEED_ATTENDEES.filter(a => a.checkedIn);

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `Generate a short (1 sentence), highly professional congratulatory quote for each of the ${attendees.length} students who successfully attended a college tech event called "${ev.title}". Return ONLY a valid JSON array of strings (one quote per student). Example: ["Excellent work on completing the event.", "Your dedication to learning is commendable."]`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      let quotes: string[] = [];
      try {
        quotes = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch (err) {
        console.error('Failed to parse Gemini response', text);
      }

      const generated: Certificate[] = attendees.map((a, i) => ({
        id: a.id,
        studentName: a.name,
        rollNumber: a.rollNumber,
        eventTitle: ev.title,
        date: ev.date,
        uniqueCode: generateUniqueCode(ev.title, a.rollNumber),
        quote: quotes[i] || "Thank you for your attendance and dedication to continuous learning."
      }));
      
      setCerts(generated);
    } catch (e) {
      console.error('Error generating certificates:', e);
    } finally {
      setGenerating(false);
    }
  };

  const downloadAll = () => {
    certs.forEach((cert, i) => {
      const html = `
        <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#000;color:#fff">
          <h1 style="color:#00D4FF">ACRO<span style="color:#fff">HIVE</span></h1>
          <h2>Certificate of Attendance</h2>
          <p style="font-size:24px;margin:20px 0">${cert.studentName}</p>
          <p>has successfully attended <strong>${cert.eventTitle}</strong></p>
          <p style="color:#00D4FF;font-style:italic;margin:30px 0">"${cert.quote}"</p>
          <p style="color:#aaa">${formatDate(cert.date)}</p>
          <p style="font-size:10px;color:#555;margin-top:30px;font-family:monospace">${cert.uniqueCode}</p>
        </body></html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.uniqueCode}.html`;
      setTimeout(() => { a.click(); URL.revokeObjectURL(url); }, i * 100);
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Controls */}
      <div className="bg-[#0d1a2e] border border-cyan-400/20 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Award className="text-cyan-400" size={22} />
          <div>
            <h2 className="text-lg font-bold">Generate Certificates</h2>
            <p className="text-gray-400 text-sm">Select a closed event. Certificates are generated per verified attendee via Gemini 1.5 Flash.</p>
          </div>
        </div>
        <select
          value={selectedEventId}
          onChange={e => { setSelectedEventId(e.target.value); setCerts([]); }}
          className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-400 outline-none text-sm"
        >
          <option value="">Select event to generate certificates forΓÇª</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.title} ({e.checkedIn} attendees)</option>
          ))}
        </select>
        {events.length === 0 && (
          <p className="text-gray-500 text-sm">No eligible events (closed events with at least 1 check-in).</p>
        )}
        <div className="flex gap-3">
          <button
            disabled={!selectedEventId || generating}
            onClick={generateCerts}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-400 text-black font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-300 transition-colors"
          >
            {generating ? <><RefreshCw size={16} className="animate-spin" /> Generating via AIΓÇª</> : <><Cpu size={16}/> Generate Certificates</>}
          </button>
          {certs.length > 0 && (
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 px-5 py-3 border border-cyan-400/50 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-400/10 transition-colors"
            >
              <Download size={16} /> Download All
            </button>
          )}
        </div>
      </div>

      {/* Certificate Preview Grid */}
      {certs.length > 0 && (
        <div>
          <p className="text-gray-400 text-sm mb-3">{certs.length} certificate{certs.length > 1 ? 's' : ''} generated</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certs.map(cert => (
              <div
                key={cert.id}
                className="bg-[#0d1a2e] border border-cyan-400/25 rounded-xl p-5 relative overflow-hidden anim-slide-down"
                style={{ boxShadow: 'inset 0 0 30px rgba(0,212,255,0.03)' }}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/5 rounded-bl-full" />

                <p className="text-xs font-bold text-cyan-400 tracking-widest mb-3">CERTIFICATE OF ATTENDANCE</p>
                <p className="text-xl font-bold text-white">{cert.studentName}</p>
                <p className="text-gray-400 text-sm mt-1">{cert.eventTitle}</p>
                <p className="text-gray-500 text-xs mt-0.5">{formatDate(cert.date)}</p>
                {cert.quote && <p className="text-gray-300 text-sm mt-3 italic">"{cert.quote}"</p>}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs font-mono text-gray-600 break-all">{cert.uniqueCode}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
// STUDENT DASHBOARD
// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
export function StudentDashboard({ userId }: { userId: string }) {
  const [registrations, setRegistrations] = useState<StudentRegistration[]>(SEED_STUDENT_REGS);
  const [timeline] = useState<TimelineEntry[]>(SEED_TIMELINE);
  const [qrEvent, setQrEvent] = useState<StudentRegistration | null>(null);

  const attended  = registrations.filter(r => r.checkedIn).length;
  const total     = registrations.length;
  const rate      = total > 0 ? Math.round((attended / total) * 100) + '%' : '0%';

  // Realtime: own new registrations
  useEffect(() => {
    const channel = supabase
      .channel(`student-regs-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'registrations', filter: `student_id=eq.${userId}` }, (payload) => {
        const row = payload.new as any;
        const newReg: StudentRegistration = {
          id: row.id,
          eventTitle: row.event_title ?? 'New Event',
          date: row.event_date ?? '',
          venue: row.venue_name ?? '',
          seatStatus: 'Confirmed',
          checkedIn: false,
          isNew: true,
        };
        setRegistrations(prev => [newReg, ...prev]);
        setTimeout(() => setRegistrations(prev => prev.map(r => ({ ...r, isNew: false }))), 900);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-cyan-400" size={28} />
          My Campus Activity
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Your registered events and check-in history.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Events Registered" value={total}    icon={<Calendar size={20}/>}   pulse={false} />
        <MetricCard title="Events Attended"   value={attended} icon={<CheckCircle size={20}/>} pulse={false} />
        <MetricCard title="Attendance Rate"   value={rate}     icon={<Activity size={20}/>}   pulse={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Registered Events Table */}
        <div className="lg:col-span-2 bg-[#0d1a2e] border border-cyan-400/20 rounded-xl p-6 overflow-x-auto">
          <h3 className="text-base font-bold mb-5">My Registered Events</h3>
          <table className="w-full text-left text-sm min-w-[560px]">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="pb-3 pr-4 font-medium">Event</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Venue</th>
                <th className="pb-3 pr-4 font-medium">Seat</th>
                <th className="pb-3 pr-4 font-medium">Ticket</th>
                <th className="pb-3 font-medium">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-800/40 hover:bg-white/3 transition-colors ${r.isNew ? 'anim-row-fade' : ''}`}
                >
                  <td className="py-3.5 pr-4 font-medium text-white">{r.eventTitle}</td>
                  <td className="py-3.5 pr-4 text-gray-400 font-mono text-xs">{r.date}</td>
                  <td className="py-3.5 pr-4 text-gray-400 text-xs truncate max-w-[100px]">{r.venue}</td>
                  <td className="py-3.5 pr-4">
                    {r.seatStatus === 'Confirmed'
                      ? <span className="text-cyan-400 text-xs font-semibold">Confirmed</span>
                      : <span className="text-amber-400 text-xs font-semibold">Waitlisted</span>}
                  </td>
                  <td className="py-3.5 pr-4">
                    <button
                      onClick={() => setQrEvent(r)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-gray-700 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                    >
                      <QrCode size={11} /> View
                    </button>
                  </td>
                  <td className="py-3.5">
                    {r.checkedIn
                      ? <span className="text-green-400 text-xs">Γ£à {r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString('en-IN', { hour12: false }) : ''}</span>
                      : <span className="text-gray-500 text-xs">ΓÅ│ Not yet</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity Timeline */}
        <div className="bg-[#0d1a2e] border border-cyan-400/20 rounded-xl p-6">
          <h3 className="text-base font-bold mb-5 flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" /> Activity Timeline
          </h3>
          <div className="relative border-l-2 border-cyan-400/25 ml-2 space-y-6 pb-2">
            {timeline.map((t, i) => (
              <div key={t.id} className="relative pl-5">
                {/* Dot */}
                <div
                  className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                    i === 0
                      ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.7)]'
                      : 'bg-[#0a0f1a] border-gray-600'
                  }`}
                />
                <p className="text-sm font-medium text-white leading-snug">
                  {t.type === 'registration'
                    ? `Registered for ${t.eventTitle}`
                    : `Checked in to ${t.eventTitle}`}
                  {t.method && <span className="text-cyan-400 text-xs font-mono ml-1"> via {t.method}</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(t.date)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Ticket Modal */}
      {qrEvent && <QRTicketModal event={qrEvent} onClose={() => setQrEvent(null)} />}
    </div>
  );
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// QR TICKET MODAL
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function QRTicketModal({ event, onClose }: { event: StudentRegistration; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0a0f1a] border border-cyan-400/30 rounded-2xl p-8 max-w-sm w-full text-center anim-slide-down"
        style={{ boxShadow: '0 0 60px rgba(0,212,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
          <X size={16} />
        </button>
        <p className="text-xs font-bold text-cyan-400 tracking-widest mb-4">QR TICKET</p>
        <div className="w-44 h-44 mx-auto bg-white rounded-xl flex items-center justify-center mb-4">
          {/* Real QR would use a library like qrcode.react ΓÇö showing placeholder SVG */}
          <svg viewBox="0 0 100 100" className="w-36 h-36 text-black fill-current">
            <rect x="10" y="10" width="30" height="30" rx="2"/>
            <rect x="60" y="10" width="30" height="30" rx="2"/>
            <rect x="10" y="60" width="30" height="30" rx="2"/>
            <rect x="15" y="15" width="20" height="20" rx="1" fill="white"/>
            <rect x="65" y="15" width="20" height="20" rx="1" fill="white"/>
            <rect x="15" y="65" width="20" height="20" rx="1" fill="white"/>
            <rect x="60" y="60" width="8" height="8"/>
            <rect x="72" y="60" width="8" height="8"/>
            <rect x="84" y="60" width="8" height="8"/>
            <rect x="60" y="72" width="8" height="8"/>
            <rect x="84" y="72" width="8" height="8"/>
            <rect x="72" y="84" width="8" height="8"/>
            <rect x="84" y="84" width="8" height="8"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">{event.eventTitle}</h2>
        <p className="text-gray-400 text-sm mt-1">{event.date} ┬╖ {event.venue}</p>
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs font-mono text-gray-600">ACRO-{event.id.toUpperCase().padEnd(4, '0').slice(0,4)}-XXXXXX</p>
        </div>
        <p className="text-gray-500 text-xs mt-3">Show this QR to the scanner at the venue.</p>
      </div>
    </div>
  );
}
