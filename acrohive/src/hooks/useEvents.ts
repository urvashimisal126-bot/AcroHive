import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches active events from Supabase.
 * "Active" = attendance_open is true AND date_time >= start of today.
 */
export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('attendance_open', true)
        .gte('date_time', today.toISOString())
        .order('date_time', { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        console.error('[useEvents] Fetch error:', fetchError);
        setError(fetchError.message);
        setEvents([]);
      } else {
        setEvents((data as Event[]) || []);
      }

      setLoading(false);
    };

    fetchEvents();

    // Subscribe to realtime changes on the events table
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          if (!cancelled) fetchEvents();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { events, loading, error };
}
