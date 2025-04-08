import React, { useState } from 'react';
import DispoStaff from '../modals/DispoStaff';

interface StaffMember {
  id: string;
  name: string;
  imageUrl: string;
}

const Staff = () => {
  // État pour suivre quel membre du personnel a sa modale ouverte
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // Liste des membres du personnel
  const staffMembers: StaffMember[] = [
    {
      id: 'bea',
      name: 'Béa',
      imageUrl: 'src/assets/bea.png' // Image placeholder temporaire
    },
    {
      id: 'cyrille',
      name: 'Cyrille',
      imageUrl: 'src/assets/cyrille.png' // Image placeholder temporaire
    }
  ];

  // Ouvre la modale pour un membre du personnel spécifique
  const openModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
  };

  // Ferme la modale
  const closeModal = () => {
    setSelectedStaff(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-6">Notre équipe</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {staffMembers.map((staff) => (
          <div key={staff.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <div className="rounded-full overflow-hidden mb-4 border-2 border-gray-900">
              <img 
                src={staff.imageUrl} 
                alt={`Photo de ${staff.name}`} 
                className="w-32 h-32 object-cover"
              />
            </div>
            
            <h3 className="text-lg font-medium mb-2">{staff.name}</h3>
            
            <button
              onClick={() => openModal(staff)}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Gérer les disponibilités
            </button>
          </div>
        ))}
      </div>

      {/* Modale de gestion des disponibilités */}
      {selectedStaff && (
        <DispoStaff 
          isOpen={!!selectedStaff}
          onClose={closeModal}
          staffId={selectedStaff.id}
          staffName={selectedStaff.name}
        />
      )}
    </div>
  );
};

export default Staff;