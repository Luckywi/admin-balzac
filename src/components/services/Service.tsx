import { useState, useEffect } from 'react';
import { 
  collection, getDocs, doc, deleteDoc, 
  query, orderBy, onSnapshot, where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AddSectionModal from '../modals/AddSectionModal';
import EditSectionModal from '../modals/EditSectionModal';
import AddServiceModal from '../modals/AddServiceModal';
import EditServiceModal from '../modals/EditServiceModal';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  sectionId: string;
}

interface ServiceSection {
  id: string;
  title: string;
  services: ServiceItem[];
  isOpen: boolean;
  createdAt?: any;
}

const Service = () => {
  const [sections, setSections] = useState<ServiceSection[]>([]);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les sections et les services au chargement du composant
  useEffect(() => {
    loadData();
  }, []);
  
  // Charger les données depuis Firestore
  // Charger les données depuis Firestore
const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Créer un abonnement aux changements de sections
      const sectionsQuery = query(collection(db, 'sections'), orderBy('createdAt', 'asc'));
      const unsubscribeSections = onSnapshot(sectionsQuery, (sectionsSnapshot) => {
        const sectionsData: ServiceSection[] = sectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          services: [],
          isOpen: true,
          createdAt: doc.data().createdAt
        }));
        
        // Créer un abonnement aux changements de services
        const servicesQuery = query(collection(db, 'services'));
        const unsubscribeServices = onSnapshot(servicesQuery, (servicesSnapshot) => {
          const servicesData: ServiceItem[] = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description || '',
            duration: doc.data().duration || 30,
            price: doc.data().price || 0,
            sectionId: doc.data().sectionId
          }));
          
          // Associer les services à leurs sections
          const sectionsWithServices = sectionsData.map(section => {
            const sectionServices = servicesData.filter(service => service.sectionId === section.id);
            return {
              ...section,
              services: sectionServices
            };
          });
          
          setSections(sectionsWithServices);
          setIsLoading(false);
        });
        
        // Nettoyer l'abonnement des services quand le composant est démonté
        return () => {
          unsubscribeServices();
        };
      }, (err) => {
        console.error("Erreur lors de l'abonnement aux sections:", err);
        setError("Impossible de charger les données. Veuillez réessayer.");
        setIsLoading(false);
      });
      
      // Nettoyer l'abonnement des sections quand le composant est démonté
      return () => {
        unsubscribeSections();
      };
      
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Une erreur est survenue lors du chargement des données.");
      setIsLoading(false);
    }
  };
  
  // Fonctions pour les sections
  const handleAddSection = (title: string) => {
    // La section est déjà ajoutée à Firebase par AddSectionModal
    // Ici on ferme juste la modale, le reste est géré par l'abonnement Firestore
    setIsAddSectionModalOpen(false);
  };
  
  const handleEditSection = async (id: string, title: string) => {
    // Cette fonction est appelée par EditSectionModal après la mise à jour dans Firebase
    setIsEditSectionModalOpen(false);
    setCurrentSectionId(null);
  };
  
  const handleDeleteSection = async (sectionId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette section et tous ses services ?")) {
      try {
        // 1. Supprimer tous les services de cette section
        const servicesQuery = query(
          collection(db, 'services'), 
          where('sectionId', '==', sectionId)
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        
        const deletePromises = servicesSnapshot.docs.map(serviceDoc => 
          deleteDoc(doc(db, 'services', serviceDoc.id))
        );
        
        await Promise.all(deletePromises);
        
        // 2. Supprimer la section
        await deleteDoc(doc(db, 'sections', sectionId));
        
        // Les modifications seront reflétées par l'abonnement onSnapshot
        
      } catch (err) {
        console.error("Erreur lors de la suppression de la section:", err);
        setError("Une erreur est survenue lors de la suppression. Veuillez réessayer.");
      }
    }
  };
  
  const openEditSectionModal = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setIsEditSectionModalOpen(true);
  };
  
  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, isOpen: !section.isOpen } : section
    ));
  };

  // Fonctions pour les services
  const handleAddService = (serviceData: Omit<ServiceItem, 'id' | 'sectionId'>) => {
    // Le service est déjà ajouté à Firebase par AddServiceModal
    // On ferme juste la modale, le reste est géré par l'abonnement Firestore
    setIsAddServiceModalOpen(false);
    setCurrentSectionId(null);
  };
  
  const handleEditService = (serviceData: Omit<ServiceItem, 'id' | 'sectionId'>) => {
    // Cette fonction est appelée par EditServiceModal après la mise à jour dans Firebase
    setIsEditServiceModalOpen(false);
    setCurrentSectionId(null);
    setCurrentServiceId(null);
  };
  
  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await deleteDoc(doc(db, 'services', serviceId));
        // Les modifications seront reflétées par l'abonnement onSnapshot
      } catch (err) {
        console.error("Erreur lors de la suppression du service:", err);
        setError("Une erreur est survenue lors de la suppression. Veuillez réessayer.");
      }
    }
  };
  
  const openAddServiceModal = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setIsAddServiceModalOpen(true);
  };
  
  const openEditServiceModal = (sectionId: string, serviceId: string) => {
    setCurrentSectionId(sectionId);
    setCurrentServiceId(serviceId);
    setIsEditServiceModalOpen(true);
  };
  
  // Fonction pour formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };
  
  // Fonction pour formater la durée
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
        : `${hours}h`;
    }
  };

  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-900 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Services proposés</h2>
        </div>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-gray-900 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Chargement des services...</p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-900 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Services proposés</h2>
        </div>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-2">Erreur de chargement</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* En-tête */}
      <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Services proposés</h2>
        <button
          onClick={() => setIsAddSectionModalOpen(true)}
          className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        >
          Ajouter une section
        </button>
      </div>
      
      {/* Contenu */}
      <div className="p-6">
        {sections.length > 0 ? (
          <div className="space-y-6">
            {sections.map(section => (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* En-tête de section */}
                <div 
                  className="bg-gray-50 px-6 py-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-500 mr-2 transition-transform ${section.isOpen ? 'transform rotate-90' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="font-medium text-lg text-gray-900">{section.title}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditSectionModal(section.id);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none"
                      title="Modifier la section"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                      title="Supprimer la section"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddServiceModal(section.id);
                      }}
                      className="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Ajouter un service
                    </button>
                  </div>
                </div>
                
                {/* Contenu de la section (services) */}
                {section.isOpen && (
                  <div className="p-6">
                    {section.services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.services.map(service => (
                          <div 
                            key={service.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{service.title}</h4>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openEditServiceModal(section.id, service.id)}
                                  className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none"
                                  title="Modifier le service"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service.id)}
                                  className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                                  title="Supprimer le service"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-gray-500 text-sm">
                                {formatDuration(service.duration)}
                              </span>
                              <span className="font-bold text-gray-900">
                                {formatPrice(service.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Aucun service dans cette section
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Aucune section de service configurée</p>
            <p className="mt-2">Cliquez sur "Ajouter une section" pour commencer</p>
          </div>
        )}
      </div>
      
      {/* Modales */}
      {isAddSectionModalOpen && (
        <AddSectionModal
          onClose={() => setIsAddSectionModalOpen(false)}
          onSubmit={handleAddSection}
        />
      )}
      
      {isEditSectionModalOpen && currentSectionId && (
        <EditSectionModal
          onClose={() => {
            setIsEditSectionModalOpen(false);
            setCurrentSectionId(null);
          }}
          onSubmit={(title) => handleEditSection(currentSectionId, title)}
          currentTitle={sections.find(s => s.id === currentSectionId)?.title || ''}
          sectionId={currentSectionId}
        />
      )}
      
      {isAddServiceModalOpen && currentSectionId && (
        <AddServiceModal
          onClose={() => {
            setIsAddServiceModalOpen(false);
            setCurrentSectionId(null);
          }}
          onSubmit={handleAddService}
          sectionId={currentSectionId}
        />
      )}
      
      {isEditServiceModalOpen && currentSectionId && currentServiceId && (
        <EditServiceModal
          onClose={() => {
            setIsEditServiceModalOpen(false);
            setCurrentSectionId(null);
            setCurrentServiceId(null);
          }}
          onSubmit={handleEditService}
          currentService={
            sections
              .find(s => s.id === currentSectionId)
              ?.services.find(serv => serv.id === currentServiceId) || 
              { id: '', title: '', description: '', duration: 30, price: 0, sectionId: currentSectionId }
          }
          serviceId={currentServiceId}
        />
      )}
    </div>
  );
};

export default Service;