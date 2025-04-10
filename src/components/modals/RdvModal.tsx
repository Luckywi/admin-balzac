import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { isWithinInterval, format, addMinutes, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface RdvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Types pour les services et sections
interface Service {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  sectionId: string;
}

interface Section {
  id: string;
  title: string;
}

interface StaffMember {
  id: string;
  name: string;
}

interface WorkHours {
  start: string;
  end: string;
}

interface Break {
  id: string;
  day: string;
  start: string;
  end: string;
}

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface SalonConfig {
  workDays: Record<string, boolean>;
  workHours: Record<string, WorkHours>;
  breaks: Break[];
  vacations: Vacation[];
  updatedAt: any;
}

interface StaffAvailability {
  staffId: string;
  workingHours: Record<string, { working: boolean; ranges: { start: string; end: string }[] }>;
  breaks: Break[];
  vacations: Vacation[];
}

interface Rdv {
  id: string;
  start: string;
  end: string;
  staffId: string;
}

const DAYS_OF_WEEK = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
];

const RdvModal = ({ isOpen, onClose }: RdvModalProps) => {
  // États principaux du formulaire
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    notes: '',
    staffId: '',
    date: '',
    time: ''
  });

  // État pour la progression du formulaire
  const [step, setStep] = useState(1);

  // États pour les données et sélections
  const [sections, setSections] = useState<Section[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [existingRdvs, setExistingRdvs] = useState<Rdv[]>([]);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  // États pour la configuration et les disponibilités
  const [salonConfig, setSalonConfig] = useState<SalonConfig | null>(null);
  const [staffAvailability, setStaffAvailability] = useState<StaffAvailability | null>(null);
  
  // États pour le traitement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);

  // Chargement initial des données
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        loadSectionsAndServices(),
        loadStaffMembers(),
        loadSalonConfig(),
        loadExistingRdvs()
      ]).then(() => {
        setIsGlobalLoading(false);
      }).catch(error => {
        console.error("Erreur lors du chargement initial:", error);
        setIsGlobalLoading(false);
        setError("Impossible de charger les données nécessaires. Veuillez réessayer.");
      });
    }
  }, [isOpen]);

  // Effet pour charger les disponibilités du staff quand il est sélectionné
  useEffect(() => {
    if (formData.staffId) {
      loadStaffAvailability(formData.staffId);
    }
  }, [formData.staffId]);

  // Effet pour mettre à jour les créneaux disponibles quand la date change
  useEffect(() => {
    if (selectedDate && formData.staffId && selectedService) {
      generateAvailableTimeSlots(selectedDate, formData.staffId, selectedService.duration);
    }
  }, [selectedDate, formData.staffId, selectedService]);

  // Effet pour mettre à jour le champ date dans formData
  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [selectedDate]);

  // Charger les sections et services
  const loadSectionsAndServices = async () => {
    try {
      setLoading(true);
      
      // Charger les sections
      const sectionsSnapshot = await getDocs(collection(db, 'sections'));
      const sectionsData = sectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
      }));
      setSections(sectionsData);
      
      // Charger les services
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description || '',
        duration: doc.data().duration || 30,
        price: doc.data().price || 0,
        sectionId: doc.data().sectionId
      }));
      setServices(servicesData);
      
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Impossible de charger les services. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Charger les membres du staff
  const loadStaffMembers = async () => {
    try {
      const staffSnapshot = await getDocs(collection(db, 'staff'));
      const staffData = staffSnapshot.docs.map(doc => {
        return {
          id: doc.id,
          name: doc.id.charAt(0).toUpperCase() + doc.id.slice(1)
        };
      });
      
      setStaffMembers(staffData);
    } catch (err) {
      console.error("Erreur lors du chargement des coiffeurs:", err);
      setError("Impossible de charger les coiffeurs. Veuillez réessayer.");
    }
  };

  // Charger la configuration du salon
  const loadSalonConfig = async () => {
    try {
      const docRef = doc(db, 'salon', 'config');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as SalonConfig;
        setSalonConfig(data);
      } else {
        console.log("Aucune configuration de salon trouvée");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la configuration du salon:", err);
      setError("Impossible de charger les horaires du salon. Veuillez réessayer.");
    }
  };

  // Charger les disponibilités d'un membre du staff
  const loadStaffAvailability = async (staffId: string) => {
    try {
      const docRef = doc(db, 'staff', staffId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as StaffAvailability;
        setStaffAvailability(data);
      } else {
        console.log(`Aucune disponibilité trouvée pour le coiffeur ${staffId}`);
      }
    } catch (err) {
      console.error(`Erreur lors du chargement des disponibilités du coiffeur ${staffId}:`, err);
      setError("Impossible de charger les disponibilités du coiffeur. Veuillez réessayer.");
    }
  };

  // Charger les rendez-vous existants
  const loadExistingRdvs = async () => {
    try {
      const rdvsSnapshot = await getDocs(collection(db, 'rdvs'));
      const rdvsData = rdvsSnapshot.docs.map(doc => ({
        id: doc.id,
        start: doc.data().start,
        end: doc.data().end,
        staffId: doc.data().staffId
      }));
      
      setExistingRdvs(rdvsData);
    } catch (err) {
      console.error("Erreur lors du chargement des rendez-vous existants:", err);
      setError("Impossible de vérifier les disponibilités. Veuillez réessayer.");
    }
  };

  // Vérifier si une date est un jour de fermeture du salon
  const isSalonClosed = (date: Date): boolean => {
    if (!salonConfig) return true;
    
    // Vérifier si c'est un jour de fermeture hebdomadaire
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    if (!salonConfig.workDays[dayOfWeek]) {
      return true;
    }
    
    // Vérifier si c'est un jour de fermeture exceptionnel (vacances)
    const vacationClosed = salonConfig.vacations.some(vacation => {
      const startDate = new Date(vacation.startDate);
      const endDate = new Date(vacation.endDate);
      endDate.setHours(23, 59, 59, 999); // Inclure le jour de fin complet
      
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
    
    return vacationClosed;
  };

  // Vérifier si c'est un jour où le staff ne travaille pas
  const isStaffDayOff = (date: Date): boolean => {
    if (!staffAvailability) return true;
    
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    
    // Vérifier si c'est un jour de repos hebdomadaire
    if (!staffAvailability.workingHours[dayOfWeek]?.working) {
      return true;
    }
    
    // Vérifier si c'est un jour de vacances
    return staffAvailability.vacations.some(vacation => {
      const startDate = new Date(vacation.startDate);
      const endDate = new Date(vacation.endDate);
      endDate.setHours(23, 59, 59, 999); // Inclure le jour de fin complet
      
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };
  
  // Fonction pour générer les créneaux horaires disponibles
  const generateAvailableTimeSlots = (date: Date, staffId: string, duration: number) => {
    if (!salonConfig || !staffAvailability) {
      setAvailableTimeSlots([]);
      return;
    }
    
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    const salonHours = salonConfig.workHours[dayOfWeek];
    const staffDaySchedule = staffAvailability.workingHours[dayOfWeek];
    
    if (!salonHours || !staffDaySchedule || !staffDaySchedule.working) {
      setAvailableTimeSlots([]);
      return;
    }
    
    // Trouver l'intersection des heures du salon et du staff
    const workRanges: {start: string, end: string}[] = [];
    
    for (const staffRange of staffDaySchedule.ranges) {
      // Vérifier que la plage du staff est dans les heures d'ouverture du salon
      if (staffRange.start < salonHours.end && staffRange.end > salonHours.start) {
        // Prendre l'intersection
        const rangeStart = staffRange.start < salonHours.start ? salonHours.start : staffRange.start;
        const rangeEnd = staffRange.end > salonHours.end ? salonHours.end : staffRange.end;
        
        workRanges.push({ start: rangeStart, end: rangeEnd });
      }
    }
    
    if (workRanges.length === 0) {
      setAvailableTimeSlots([]);
      return;
    }
    
    // Récupérer les pauses du salon et du staff pour ce jour
    const salonBreaks = salonConfig.breaks.filter(b => b.day === dayOfWeek);
    const staffBreaks = staffAvailability.breaks.filter(b => b.day === dayOfWeek);
    
    // Récupérer les rendez-vous existants pour ce staff et cette date
    const dateString = format(date, 'yyyy-MM-dd');
    const dayRdvs = existingRdvs.filter(rdv => {
      return rdv.staffId === staffId && rdv.start.startsWith(dateString);
    });
    
    // Générer les créneaux disponibles par intervalles de 15 minutes
    const slots: string[] = [];
    
    workRanges.forEach(range => {
      let currentTime = range.start;
      
      while (currentTime <= range.end) {
        // Vérifier si ce créneau chevauche une pause du salon
        const isSalonBreak = salonBreaks.some(breakItem => {
          return currentTime >= breakItem.start && currentTime < breakItem.end;
        });
        
        // Vérifier si ce créneau chevauche une pause du staff
        const isStaffBreak = staffBreaks.some(breakItem => {
          return currentTime >= breakItem.start && currentTime < breakItem.end;
        });
        
        // Vérifier si le créneau + durée du service chevauche un rendez-vous existant
        const [hours, minutes] = currentTime.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hours, minutes, 0, 0);
        
        const slotEnd = addMinutes(slotStart, duration);
        const slotEndTime = format(slotEnd, 'HH:mm');
        
        // Vérifier que la fin du créneau reste dans les heures travaillées
        if (slotEndTime > range.end) {
          // Créneau trop long pour cette plage horaire
          break;
        }
        
        const conflictsWithExistingRdv = dayRdvs.some(rdv => {
          const rdvStart = new Date(rdv.start);
          const rdvEnd = new Date(rdv.end);
          
          // Vérifier s'il y a chevauchement
          return (
            (slotStart < rdvEnd && slotEnd > rdvStart)
          );
        });
        
        // Si le créneau est disponible, l'ajouter
        if (!isSalonBreak && !isStaffBreak && !conflictsWithExistingRdv) {
          slots.push(currentTime);
        }
        
        // Passer au créneau suivant (par incréments de 15 minutes)
        const currentDate = new Date();
        const [h, m] = currentTime.split(':').map(Number);
        currentDate.setHours(h, m + 15, 0, 0);
        currentTime = format(currentDate, 'HH:mm');
      }
    });
    
    setAvailableTimeSlots(slots);
  };

  // Fonction pour désactiver les dates dans le calendrier
  const isDateDisabled = (date: Date) => {
    const isBeforeToday = date < new Date(new Date().setHours(0, 0, 0, 0));
    const isClosed = isSalonClosed(date);
    const isStaffOff = formData.staffId ? isStaffDayOff(date) : false;
    
    return isBeforeToday || isClosed || isStaffOff;
  };

  // Gérer les changements de champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Réinitialiser l'erreur de temps si on change la date ou l'heure
    if (name === 'date' || name === 'time') {
      setTimeError(null);
    }
    
    // Mettre à jour les étapes en fonction du champ modifié
    if (name === 'clientName' && value.trim() !== '') {
      setStep(Math.max(step, 2));
    }
    
    if (name === 'staffId' && value !== '') {
      setStep(Math.max(step, 4));
      // Réinitialiser la date et l'heure quand on change de staff
      setSelectedDate(undefined);
      setFormData(prev => ({ ...prev, date: '', time: '' }));
    }
  };

  // Gérer la sélection d'un service
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setOpenSectionId(null);
    setStep(Math.max(step, 3));
    
    // Réinitialiser les sélections qui dépendent du service
    setFormData(prev => ({ ...prev, staffId: '', date: '', time: '' }));
    setSelectedDate(undefined);
  };

  // Gérer l'ouverture/fermeture des sections de services
  const toggleSection = (sectionId: string) => {
    if (openSectionId === sectionId) {
      setOpenSectionId(null);
    } else {
      setOpenSectionId(sectionId);
    }
  };

  // Récupérer les services par section
  const getServicesForSection = (sectionId: string) => {
    return services.filter(service => service.sectionId === sectionId);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !selectedService || !formData.date || !formData.time || !formData.staffId) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setLoading(true);
      
      // Construire l'objet du RDV
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + selectedService.duration * 60000);
      
      const rdvData = {
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        serviceDuration: selectedService.duration,
        staffId: formData.staffId,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        notes: formData.notes,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        price: selectedService.price,
        source: 'RdvSalon', // Marquer comme créé depuis le salon
        createdAt: serverTimestamp(),
      };
      
      // Ajouter à Firestore
      await addDoc(collection(db, 'rdvs'), rdvData);
      
      // Réinitialiser le formulaire et afficher un message de succès
      setFormData({
        clientName: '',
        clientPhone: '',
        notes: '',
        staffId: '',
        date: '',
        time: ''
      });
      setSelectedService(null);
      setSelectedDate(undefined);
      setAvailableTimeSlots([]);
      setStep(1);
      setSuccess(true);
      
      // Fermer la modale après 1,5 secondes
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Erreur lors de la création du rendez-vous:", err);
      setError("Impossible de créer le rendez-vous. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Ne rien afficher si la modale n'est pas ouverte
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-800 px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-white">Nouveau rendez-vous</h3>
        </div>
        
        {isGlobalLoading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-800 mb-4" />
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4 bg-red-100 text-red-700 mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-100 text-green-700 mb-4">
                Rendez-vous créé avec succès!
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                {/* Étape 1: Informations client */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du client *
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      className="w-full bg-white px-3 py-2 border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                      placeholder="Nom et prénom"
                      required
                    />
                  </div>
                  
                  {step >= 2 && (
                    <div>
                      <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="clientPhone"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleChange}
                        className="w-full bg-white px-3 py-2 border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                        placeholder="0612345678"
                      />
                    </div>
                  )}
                </div>
                
                {/* Étape 2: Sélection du service */}
                {step >= 2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service *
                    </label>
                    <div className="border border-gray-800 rounded-md overflow-hidden">
                      {selectedService ? (
                        <div 
                          className="p-3 flex justify-between items-center bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedService(null)}
                        >
                          <span className="font-medium text-gray-800">{selectedService.title}</span>
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedService(null);
                              setStep(2);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        sections.map(section => (
                          <div key={section.id} className="border-b border-gray-800 last:border-b-0">
                            <div 
                              className="p-3 flex justify-between items-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                              onClick={() => toggleSection(section.id)}
                            >
                              <span className="font-medium text-gray-800">{section.title}</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 transition-transform ${openSectionId === section.id ? 'transform rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {openSectionId === section.id && (
                              <div className="border-t border-gray-800">
                                {getServicesForSection(section.id).map(service => (
                                  <div
                                    key={service.id}
                                    className="p-3 pl-6 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between"
                                    onClick={() => handleSelectService(service)}
                                  >
                                    <span className="text-gray-800">{service.title}</span>
                                    <span className="text-gray-600">{service.price} €</span>
                                  </div>
                                ))}
                                {getServicesForSection(section.id).length === 0 && (
                                  <div className="p-3 pl-6 text-gray-500">
                                    Aucun service dans cette section
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {!selectedService && (
                      <p className="mt-1 text-sm text-gray-500">Sélectionnez une section puis un service</p>
                    )}
                  </div>
                )}
                
                {/* Étape 3: Sélection du coiffeur */}
                {step >= 3 && selectedService && (
                  <div>
                    <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
                      Coiffeur *
                    </label>
                    <select
                      id="staffId"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                      className="w-full bg-white px-3 py-2 border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                      required
                    >
                      <option value="" disabled>Sélectionnez un coiffeur</option>
                      {staffMembers.length > 0 ? (
                        staffMembers.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="bea">Béatrice</option>
                          <option value="cyrille">Cyrille</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
                
                {/* Étape 4: Sélection de la date */}
                {step >= 4 && selectedService && formData.staffId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <div className="border border-gray-800 rounded-md overflow-hidden">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={date => {
                          setSelectedDate(date);
                          if (date) setStep(Math.max(step, 5));
                        }}
                        locale={fr}
                        disabled={isDateDisabled}
                        className="rounded-md"
                      />
                    </div>
                    {selectedDate && (
                      <p className="mt-2 text-sm text-gray-600">
                        Date sélectionnée: {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Étape 5: Sélection de l'heure */}
                {step >= 5 && selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure *
                    </label>
                    
                    {availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableTimeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            className={`py-2 px-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors ${
                              formData.time === time 
                                ? 'bg-gray-800 text-white' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, time }));
                              setStep(Math.max(step, 6));
                            }}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                        Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date.
                      </div>
                    )}
                    
                    {timeError && (
                      <p className="mt-1 text-sm text-red-600">{timeError}</p>
                    )}
                  </div>
                )}
                
                {/* Étape 6: Notes (optionnel) */}
                {step >= 6 && formData.time && (
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optionnel)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-white px-3 py-2 border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                      placeholder="Notes supplémentaires (optionnel)"
                    />
                  </div>
                )}
                
                {/* Récapitulatif du rendez-vous */}
                {step >= 6 && selectedService && formData.time && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-800 mt-4">
                    <h4 className="text-base font-medium text-gray-800 mb-3">Récapitulatif du rendez-vous</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Client:</span>
                        <span className="font-medium">{formData.clientName}</span>
                      </div>
                      {formData.clientPhone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Téléphone:</span>
                          <span>{formData.clientPhone}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">{selectedService.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prix:</span>
                        <span className="font-medium">{selectedService.price} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durée:</span>
                        <span>
                          {Math.floor(selectedService.duration / 60) > 0 
                            ? `${Math.floor(selectedService.duration / 60)}h${selectedService.duration % 60 > 0 
                                ? (selectedService.duration % 60).toString().padStart(2, '0') 
                                : ''}`
                            : `${selectedService.duration} min`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coiffeur:</span>
                        <span>
                          {staffMembers.find(s => s.id === formData.staffId)?.name || 
                           (formData.staffId === 'bea' ? 'Béatrice' : 
                            formData.staffId === 'cyrille' ? 'Cyrille' : formData.staffId)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heure:</span>
                        <span>{formData.time}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg sticky bottom-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Annuler
                </Button>
                
                {step >= 6 && formData.clientName && selectedService && formData.staffId && selectedDate && formData.time && (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gray-800 hover:bg-gray-800"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer le rendez-vous'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RdvModal;