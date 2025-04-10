import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { isWithinInterval } from 'date-fns';

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

const DAYS_OF_WEEK = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
];

const RdvModal = ({ isOpen, onClose }: RdvModalProps) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '', // Optionnel
    notes: '', // Nouveau champ notes
    staffId: '',
    date: '',
    time: ''
  });

  // États pour les sections et services
  const [sections, setSections] = useState<Section[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // États pour le menu déroulant
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // État pour la configuration du salon
  const [salonConfig, setSalonConfig] = useState<SalonConfig | null>(null);
  
  // Validation du créneau
  const [timeError, setTimeError] = useState<string | null>(null);

  // Charger les sections et services au chargement de la modale
  useEffect(() => {
    if (isOpen) {
      loadSectionsAndServices();
      loadStaffMembers();
      loadSalonConfig();
      console.log("Chargement des sections, services et coiffeurs...");
    }
  }, [isOpen]);
  
  // Charger la configuration du salon
  const loadSalonConfig = async () => {
    try {
      // Récupérer la configuration du salon depuis Firestore
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
    }
  };

  const loadSectionsAndServices = async () => {
    try {
      setLoading(true);
      
      // Charger les sections
      const sectionsSnapshot = await getDocs(collection(db, 'sections'));
      const sectionsData = sectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
      }));
      console.log("Sections chargées:", sectionsData);
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
      console.log("Services chargés:", servicesData);
      setServices(servicesData);
      
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Impossible de charger les données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const loadStaffMembers = async () => {
    try {
      // Récupérer les documents de la collection staff
      const staffSnapshot = await getDocs(collection(db, 'staff'));
      const staffData = staffSnapshot.docs.map(doc => {
        // Utiliser l'ID du document comme identifiant et comme nom affiché
        return {
          id: doc.id,
          // Convertir le premier caractère en majuscule pour l'affichage
          name: doc.id.charAt(0).toUpperCase() + doc.id.slice(1)
        };
      });
      
      console.log("Coiffeurs chargés:", staffData);
      setStaffMembers(staffData);
      
    } catch (err) {
      console.error("Erreur lors du chargement des coiffeurs:", err);
      // Ne pas définir d'erreur ici pour ne pas bloquer le reste de l'interface
    }
  };

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
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setOpenSectionId(null); // Fermer le menu déroulant
  };

  const toggleSection = (sectionId: string) => {
    if (openSectionId === sectionId) {
      setOpenSectionId(null); // Fermer si c'est déjà ouvert
    } else {
      setOpenSectionId(sectionId); // Ouvrir cette section
    }
  };

  const getServicesForSection = (sectionId: string) => {
    return services.filter(service => service.sectionId === sectionId);
  };
  
  // Vérifier si une date est un jour de fermeture du salon
  const isSalonClosed = (date: Date): boolean => {
    if (!salonConfig) return false;
    
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
  
  // Vérifier si l'heure est en dehors des heures d'ouverture
  const isOutsideBusinessHours = (date: Date, endDate: Date): boolean => {
    if (!salonConfig) return false;
    
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    const dayHours = salonConfig.workHours[dayOfWeek];
    
    if (!dayHours) return true;
    
    const timeString = (d: Date) => {
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };
    
    const startTime = timeString(date);
    const endTime = timeString(endDate);
    
    // Vérifier si l'heure de début est avant l'ouverture ou l'heure de fin après la fermeture
    if (startTime < dayHours.start || endTime > dayHours.end) {
      return true;
    }
    
    // Vérifier si pendant une pause
    return salonConfig.breaks.some(breakItem => {
      if (breakItem.day === dayOfWeek) {
        // Vérifier si le RDV chevauche une pause
        return (startTime >= breakItem.start && startTime < breakItem.end) || 
               (endTime > breakItem.start && endTime <= breakItem.end) ||
               (startTime <= breakItem.start && endTime >= breakItem.end);
      }
      return false;
    });
  };

  const validateAppointmentTime = (): string | null => {
    if (!formData.date || !formData.time || !selectedService) {
      return "Veuillez sélectionner une date, une heure et un service";
    }
    
    // Créer des objets Date pour le début et la fin du RDV
    const startDateTime = new Date(`${formData.date}T${formData.time}`);
    const endDateTime = new Date(startDateTime.getTime() + selectedService.duration * 60000);
    
    // Vérifier si c'est un jour fermé
    if (isSalonClosed(startDateTime)) {
      return "Le salon est fermé à cette date";
    }
    
    // Vérifier si c'est en dehors des heures d'ouverture ou pendant une pause
    if (isOutsideBusinessHours(startDateTime, endDateTime)) {
      return "Ce créneau est en dehors des heures d'ouverture ou pendant une pause";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !selectedService || !formData.date || !formData.time || !formData.staffId) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    // Vérifier la validité du créneau
    const validationError = validateAppointmentTime();
    if (validationError) {
      setTimeError(validationError);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-900 px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-white">Nouveau rendez-vous</h3>
        </div>
        
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}
        
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
          <div className="p-6">
            <div className="space-y-4">
              {/* Informations client */}
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
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Nom et prénom"
                  required
                />
              </div>
              
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
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                  placeholder="0612345678"
                />
              </div>
              
              {/* Sélection du service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service *
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  {selectedService ? (
                    <div 
                      className="p-3 flex justify-between items-center bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedService(null)}
                    >
                      <span className="font-medium text-gray-900">{selectedService.title}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(null);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    sections.map(section => (
                      <div key={section.id} className="border-b border-gray-300 last:border-b-0">
                        <div 
                          className="p-3 flex justify-between items-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSection(section.id)}
                        >
                          <span className="font-medium text-gray-900">{section.title}</span>
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
                          <div className="border-t border-gray-300">
                            {getServicesForSection(section.id).map(service => (
                              <div
                                key={service.id}
                                className="p-3 pl-6 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between"
                                onClick={() => handleSelectService(service)}
                              >
                                <span className="text-gray-900">{service.title}</span>
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
              
              {/* Sélection du coiffeur */}
              <div>
                <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
                  Coiffeur *
                </label>
                <select
                  id="staffId"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
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
              
              {/* Sélection de la date et heure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Heure *
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                    required
                  />
                </div>
                
                {timeError && (
                  <div className="col-span-2">
                    <p className="text-sm text-red-600">{timeError}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Veuillez choisir un créneau pendant les heures d'ouverture du salon
                    </p>
                  </div>
                )}
              </div>
              
              {/* Champ de notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Notes supplémentaires (optionnel)"
                />
              </div>
              
              {/* Affichage des informations du service sélectionné */}
              {selectedService && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{selectedService.title}</span>
                    <span className="font-medium">{selectedService.price} €</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Durée: {Math.floor(selectedService.duration / 60)}h{selectedService.duration % 60 > 0 ? selectedService.duration % 60 : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer le rendez-vous'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RdvModal;