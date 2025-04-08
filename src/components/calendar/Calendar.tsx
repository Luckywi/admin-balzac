import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr'; // Importation correcte de la locale française
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css'; // Fichier pour la personnalisation

// Configuration de la locale française
moment.locale('fr'); // Définit le français comme locale
const localizer = momentLocalizer(moment);

// Types pour nos événements
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  client?: string;
  service?: string;
  notes?: string;
}

const Calendar: React.FC = () => {
  // État pour les événements (à remplacer par des données réelles)
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: 'Coupe et brushing - Marie Dupont',
      start: moment().hour(10).minute(0).toDate(),
      end: moment().hour(11).minute(30).toDate(),
      client: 'Marie Dupont',
      service: 'Coupe et brushing',
      notes: 'Cliente régulière'
    },
    {
      id: 2,
      title: 'Coloration - Thomas Martin',
      start: moment().add(1, 'day').hour(14).minute(0).toDate(),
      end: moment().add(1, 'day').hour(16).minute(0).toDate(),
      client: 'Thomas Martin',
      service: 'Coloration complète',
      notes: 'Première visite'
    },
    {
      id: 3,
      title: 'Coiffure mariage - Sophie Leclerc',
      start: moment().add(2, 'days').hour(9).minute(0).toDate(),
      end: moment().add(2, 'days').hour(12).minute(0).toDate(),
      client: 'Sophie Leclerc',
      service: 'Coiffure mariage',
      notes: 'Apporte des photos'
    }
  ]);

  // État pour l'événement sélectionné
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Gestion de la sélection d'un créneau pour ajouter un RDV
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Ici, vous pourriez ouvrir un modal pour créer un RDV
    console.log('Créneau sélectionné:', { start, end });
  };

  // Gestion du clic sur un événement
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    // Ici, vous pourriez ouvrir un modal pour voir/modifier un RDV
    console.log('Événement sélectionné:', event);
  };

  // Format des événements dans le calendrier
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: '#4F46E5', // Indigo-600
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontWeight: 500
      }
    };
  };

  // Messages personnalisés en français
  const messages = {
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
    noEventsInRange: 'Aucun événement dans cette plage',
    showMore: (total: number) => `+ ${total} événement(s) supplémentaire(s)`
  };

  // Format des créneaux horaires - définition explicite pour tous les formats
  const formats = {
    dayFormat: (date: Date) => moment(date).format('dddd DD'),
    weekdayFormat: (date: Date) => moment(date).format('dddd'),
    timeGutterFormat: (date: Date) => moment(date).format('HH:mm'),
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
    },
    dayHeaderFormat: (date: Date) => moment(date).format('dddd DD MMMM'),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('DD MMMM')} - ${moment(end).format('DD MMMM YYYY')}`;
    },
    monthHeaderFormat: (date: Date) => moment(date).format('MMMM YYYY'),
    agendaDateFormat: (date: Date) => moment(date).format('dddd DD MMMM'),
    agendaTimeFormat: (date: Date) => moment(date).format('HH:mm'),
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
    }
  };

  return (
    <div className="calendar-container">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 120px)' }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        formats={formats}
        defaultView={Views.WEEK}
        min={moment().hour(8).minute(0).toDate()} // Début à 8h
        max={moment().hour(20).minute(0).toDate()} // Fin à 20h
        step={15} // Incréments de 15 minutes
        timeslots={4} // 4 créneaux par heure (15 min chacun)
        views={['month', 'week', 'day', 'agenda']}
        popup
        toolbar={true}
      />

      {/* Modal pour afficher les détails d'un événement */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedEvent.title}</h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">
                <span className="font-medium">Date: </span>
                {moment(selectedEvent.start).format('dddd DD MMMM YYYY')}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Horaire: </span>
                {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
              </p>
              {selectedEvent.client && (
                <p className="text-gray-600">
                  <span className="font-medium">Client: </span>
                  {selectedEvent.client}
                </p>
              )}
              {selectedEvent.service && (
                <p className="text-gray-600">
                  <span className="font-medium">Service: </span>
                  {selectedEvent.service}
                </p>
              )}
              {selectedEvent.notes && (
                <p className="text-gray-600">
                  <span className="font-medium">Notes: </span>
                  {selectedEvent.notes}
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;