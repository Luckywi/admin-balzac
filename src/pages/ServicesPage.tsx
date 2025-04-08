import { useState, useEffect } from 'react'
import Header from '../components/header/Header'
import Sidebar from '../components/sidebar/Sidebar'
import Staff from '../components/services/Staff'
import DispoSalon from '../components/services/DispoSalon'
import Service from '../components/services/Service'

export default function ServicesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('services'); // Active l'onglet services

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Services et prestations</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <p className="text-gray-600">
                Ce module vous permet de gérer les services proposés par votre salon ainsi que le personnel qui les réalise.
              </p>
            </div>
            
            {/* Section 1: Liste des services */}
            <div className="mb-8">
              <Service />
            </div>
            
            {/* Section 2: Horaires du salon */}
            <div className="mb-8">
              <DispoSalon />
            </div>
            
            {/* Section 3: Personnel */}
            <div className="mb-8">
              <Staff />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}