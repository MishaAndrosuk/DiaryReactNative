import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '../store/db';
import { events as eventsTable } from '../store/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface Event {
  id: string;
  title: string;
  date: string;
}

interface EventsContextType {
  events: Event[];
  addEvent: (event: Event) => Promise<void>;
  getTodayEvents: () => Event[];
}

const EventsContext = createContext<EventsContextType | null>(null);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) throw new Error('useEvents must be used within EventsProvider');
  return context;
};

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);

  const loadEvents = async () => {
    const result = await db.select().from(eventsTable);
    setEvents(result);
  };

  const addEvent = async (event: Event) => {
    await db.insert(eventsTable).values(event);
    await loadEvents();
  };

  const getTodayEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(e => e.date === today);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <EventsContext.Provider value={{ events, addEvent, getTodayEvents }}>
      {children}
    </EventsContext.Provider>
  );
};
