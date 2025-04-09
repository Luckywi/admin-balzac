import React, { useState, useEffect } from 'react'
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
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import RdvDetailsModal from '../modals/RdvDetailsModal'; // Importez la modale de détails

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
    staffId?: string;
    resourceId?: string; // Pour pouvoir éventuellement filtrer par coiffeur
    price?: number;
    clientPhone?: string;
}

interface RdvData {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceDuration: number;
  staffId: string;
  start: string; // ISO
  end: string;   // ISO
  notes?: string;
  clientName: string;
  clientPhone?: string;
  price: number;
  source: string;
}

const Calendar: React.FC<{ staffFilter?: string }> = ({ staffFilter }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewKey>('week');

  // Récupérer les rendez-vous depuis Firestore
  useEffect(() => {
    const loadRdvs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Créer un abonnement aux changements de rendez-vous
        const rdvsQuery = query(collection(db, 'rdvs'), orderBy('start', 'asc'));
        
        const unsubscribe = onSnapshot(rdvsQuery, (rdvsSnapshot) => {
          const rdvsData = rdvsSnapshot.docs.map(doc => {
            const data = doc.data() as RdvData;
            return {
              id: doc.id,
              title: `${data.serviceTitle} - ${data.clientName}`,
              start: new Date(data.start),
              end: new Date(data.end),
              client: data.clientName,
              service: data.serviceTitle,
              notes: data.notes,
              staffId: data.staffId,
              resourceId: data.staffId, // Pour filtrer par coiffeur si nécessaire
              price: data.price,
              clientPhone: data.clientPhone
            };
          });
          
          // Filtrer par coiffeur si un filtre est activé
          let filteredEvents = rdvsData;
          if (staffFilter) {
            filteredEvents = rdvsData.filter(event => event.staffId === staffFilter);
          }
          
          setEvents(filteredEvents);
          setLoading(false);
        }, (err) => {
          console.error("Erreur lors de l'abonnement aux rdvs:", err);
          setError("Impossible de charger les rendez-vous.");
          setLoading(false);
        });
        
        return () => {
          unsubscribe();
        };
        
      } catch (err) {
        console.error("Erreur lors du chargement des rdvs:", err);
        setError("Une erreur est survenue lors du chargement des rendez-vous.");
        setLoading(false);
      }
    };
    
    loadRdvs();
  }, [staffFilter]);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    console.log('Créneau sélectionné:', slotInfo);
    // Ici vous pourriez ouvrir une modale pour créer un RDV à cette date/heure
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  }

  const handleCloseModal = () => {
    setSelectedEvent(null);
  }

  // Fonction pour rafraîchir les données après une modification ou suppression
  const handleRefresh = () => {
    // On n'a pas besoin de faire quoi que ce soit ici car
    // les données sont automatiquement mises à jour via onSnapshot
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    // On pourrait personnaliser la couleur en fonction du staffId ou du type de service
    let backgroundColor = '#111827'; // Couleur par défaut
    
    // Exemple de personnalisation par coiffeur
    if (event.staffId === 'bea') {
      backgroundColor = '#047857'; // Vert pour Béa
    } else if (event.staffId === 'cyrille') {
      backgroundColor = '#1D4ED8'; // Bleu pour Cyrille
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontWeight: 500
      }
    };
  }

  return (
    <div className="calendar-container">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg shadow-md">
            <p className="font-medium mb-2">Erreur de chargement</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
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

      {/* Remplacer la modale simple par RdvDetailsModal */}
      {selectedEvent && (
        <RdvDetailsModal 
          event={selectedEvent} 
          onClose={handleCloseModal} 
          onRefresh={handleRefresh}
        />
      )}
    </div>
  )
}

export default Calendar