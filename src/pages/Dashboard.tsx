import { useState, useEffect } from 'react'
import Header from '../components/header/Header'
import Sidebar from '../components/sidebar/Sidebar'
import Calendar from '../components/calendar/Calendar'

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar'); // Options: 'calendar', 'clients', 'services'

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
    </div>
  )
}