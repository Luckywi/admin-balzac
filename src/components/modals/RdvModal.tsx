import { useState } from 'react';

interface RdvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RdvModal = ({ isOpen, onClose }: RdvModalProps) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
    staff: '',
    date: '',
    time: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pas de fonctionnalité pour l'instant
    console.log('Form data:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-900 px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-white">Nouveau rendez-vous</h3>
        </div>
        
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
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                  placeholder="Nom et prénom"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="clientPhone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                  placeholder="0612345678"
                  required
                />
              </div>
              
              {/* Sélection du service */}
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                  Service *
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                  required
                >
                  <option value="" disabled>Sélectionnez un service</option>
                  <option value="coupe-femme">Coupe femme</option>
                  <option value="coupe-homme">Coupe homme</option>
                  <option value="coloration">Coloration</option>
                  <option value="balayage">Balayage</option>
                  <option value="brushing">Brushing</option>
                </select>
              </div>
              
              {/* Sélection du coiffeur */}
              <div>
                <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-1">
                  Coiffeur *
                </label>
                <select
                  id="staff"
                  name="staff"
                  value={formData.staff}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                  required
                >
                  <option value="" disabled>Sélectionnez un coiffeur</option>
                  <option value="beatrice">Béatrice</option>
                  <option value="cyrille">Cyrille</option>
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
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
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
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                    required
                  />
                </div>
              </div>
              
              {/* Informations sur la durée et le prix - Affichage informatif */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Durée estimée:</span>
                  <span className="font-medium">45 min</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Prix:</span>
                  <span className="font-medium">45,00 €</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Créer le rendez-vous
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RdvModal;