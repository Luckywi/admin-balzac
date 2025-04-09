import React, { useState } from 'react'
import {
  Calendar as BigCalendar,
  Views,
  SlotInfo
} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './Calendar.css'

import { format as dfFormat, parse as dfParse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { dateFnsLocalizer } from 'react-big-calendar'
import type { ViewKey } from 'react-big-calendar';



// Locales disponibles
const locales = { fr }

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string, culture?: string) =>
    dfFormat(date, formatStr, { locale: fr }),
  parse: (value: string, formatStr: string, culture?: string) =>
    dfParse(value, formatStr, new Date(), { locale: fr }),
  startOfWeek: (date: Date, culture?: string) =>
    startOfWeek(date, { locale: fr }),
  getDay,
  locales,
})

interface CalendarEvent {
    id: number | string;
    title: string;
    start: Date;
    end: Date;
    client?: string;
    service?: string;
    notes?: string;
  }

const Calendar: React.FC = () => {
  const [events] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: 'Coupe et brushing - Marie Dupont',
      start: new Date(new Date().setHours(10, 0)),
      end: new Date(new Date().setHours(11, 30)),
      client: 'Marie Dupont',
      service: 'Coupe et brushing',
      notes: 'Cliente régulière'
    },
    {
      id: 2,
      title: 'Coloration - Thomas Martin',
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
      client: 'Thomas Martin',
      service: 'Coloration',
      notes: 'Première visite'
    }
  ])

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    console.log('Créneau sélectionné:', slotInfo)
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: '#111827',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      display: 'block',
      fontWeight: 500
    }
  })


  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewKey>('week');

  return (
    <div className="calendar-container">
      <BigCalendar
        localizer={localizer}
        culture="fr"
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}  
        view={view}
        onView={(newView) => {
            if (['week', 'day', 'agenda'].includes(newView)) {
              setView(newView as ViewKey);
            }
          }}
        views={['week', 'day', 'agenda']}      
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        defaultView={Views.WEEK}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        style={{ height: 'calc(100vh - 120px)' }}
        min={new Date(0, 0, 0, 8, 0)}
        max={new Date(0, 0, 0, 20, 0)}
        messages={{
          allDay: 'Journée',
          previous: 'Précédent',
          next: 'Suivant',
          today: 'Aujourd\'hui',
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Heure',
          event: 'Événement',
          noEventsInRange: 'Aucun événement prévu',
          showMore: (total: number) => `+ ${total} événement(s)`
        }}
      />

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-900 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-2 text-gray-600">
              <p><strong>Client :</strong> {selectedEvent.client}</p>
              <p><strong>Service :</strong> {selectedEvent.service}</p>
              <p><strong>Notes :</strong> {selectedEvent.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
