import { useState, useEffect } from 'react'
import Header from '../components/header/Header'
import Sidebar from '../components/sidebar/Sidebar'
import Calendar from '../components/calendar/Calendar'
import RdvModal from '../components/modals/RdvModal'

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar'); // Options: 'calendar', 'clients', 'services'
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  // Fonction pour changer d'onglet
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    closeSidebar(); // Ferme le sidebar après sélection sur mobile
  };
  
  // Désactive le défilement du contenu principal quand la sidebar est ouverte
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} onTabChange={handleTabChange} activeTab={activeTab} />
      
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          {activeTab === 'calendar' && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Calendrier des rendez-vous</h1>
              
              {/* Bouton de création de RDV */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setIsRdvModalOpen(true)}
                  className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-900 transition-colors shadow-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  CRÉER UN RDV
                </button>
              </div>
              
              {/* Boutons pour filtrer par coiffeur */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  className="px-5 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                >
                  Béatrice
                </button>
                <button
                  className="px-5 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                >
                  Cyrille
                </button>
              </div>
              
              <Calendar />
            </div>
          )}
          
          {activeTab === 'clients' && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Gestion des clients</h1>
              <p className="text-gray-600">Module de gestion des clients à venir...</p>
              {/* Futur composant de gestion des clients */}
            </div>
          )}
          
          {activeTab === 'services' && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Services et prestations</h1>
              <p className="text-gray-600">Module de gestion des services à venir...</p>
              {/* Futur composant de gestion des services */}
            </div>
          )}
        </div>
      </main>

      {/* Modale de création de RDV */}
      {isRdvModalOpen && (
        <RdvModal 
          isOpen={isRdvModalOpen} 
          onClose={() => setIsRdvModalOpen(false)} 
        />
      )}
    </div>
  )
}