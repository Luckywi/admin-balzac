import { useState } from 'react';
import AddSectionModal from '../modals/AddSectionModal';
import EditSectionModal from '../modals/EditSectionModal';
import AddServiceModal from '../modals/AddServiceModal';
import EditServiceModal from '../modals/EditServiceModal';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  duration: number; // en minutes
  price: number;
}

interface ServiceSection {
  id: string;
  title: string;
  services: ServiceItem[];
  isOpen: boolean;
}

const Service = () => {
  const [sections, setSections] = useState<ServiceSection[]>([]);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  
  // Fonctions pour les sections
  const handleAddSection = (title: string) => {
    const newSection: ServiceSection = {
      id: `section-${Date.now()}`,
      title,
      services: [],
      isOpen: true
    };
    
    setSections([...sections, newSection]);
    setIsAddSectionModalOpen(false);
  };
  
  const handleEditSection = (id: string, title: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, title } : section
    ));
    setIsEditSectionModalOpen(false);
    setCurrentSectionId(null);
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
  const handleAddService = (sectionId: string, serviceData: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      id: `service-${Date.now()}`,
      ...serviceData
    };
    
    setSections(sections.map(section =>
      section.id === sectionId 
        ? { ...section, services: [...section.services, newService] }
        : section
    ));
    
    setIsAddServiceModalOpen(false);
    setCurrentSectionId(null);
  };
  
  const handleEditService = (sectionId: string, serviceId: string, serviceData: Omit<ServiceItem, 'id'>) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            services: section.services.map(service =>
              service.id === serviceId
                ? { ...service, ...serviceData }
                : service
            )
          }
        : section
    ));
    
    setIsEditServiceModalOpen(false);
    setCurrentSectionId(null);
    setCurrentServiceId(null);
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
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
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
                              <button
                                onClick={() => openEditServiceModal(section.id, service.id)}
                                className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
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
        />
      )}
      
      {isAddServiceModalOpen && currentSectionId && (
        <AddServiceModal
          onClose={() => {
            setIsAddServiceModalOpen(false);
            setCurrentSectionId(null);
          }}
          onSubmit={(data) => handleAddService(currentSectionId, data)}
        />
      )}
      
      {isEditServiceModalOpen && currentSectionId && currentServiceId && (
        <EditServiceModal
          onClose={() => {
            setIsEditServiceModalOpen(false);
            setCurrentSectionId(null);
            setCurrentServiceId(null);
          }}
          onSubmit={(data) => handleEditService(currentSectionId, currentServiceId, data)}
          currentService={
            sections
              .find(s => s.id === currentSectionId)
              ?.services.find(serv => serv.id === currentServiceId) || 
              { id: '', title: '', description: '', duration: 30, price: 0 }
          }
        />
      )}
    </div>
  );
};

export default Service;