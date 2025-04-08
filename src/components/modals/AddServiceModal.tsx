import { useState } from 'react';

interface ServiceData {
  title: string;
  description: string;
  duration: number;
  price: number;
}

interface AddServiceModalProps {
  onClose: () => void;
  onSubmit: (serviceData: ServiceData) => void;
}

const AddServiceModal = ({ onClose, onSubmit }: AddServiceModalProps) => {
  const [serviceData, setServiceData] = useState<ServiceData>({
    title: '',
    description: '',
    duration: 30,
    price: 0
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setServiceData({
      ...serviceData,
      [name]: name === 'duration' || name === 'price' 
        ? parseFloat(value) || 0
        : value
    });
    
    // Effacer l'erreur pour ce champ
    if (errors[name as keyof ServiceData]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Partial<Record<keyof ServiceData, string>> = {};
    
    if (!serviceData.title.trim()) {
      newErrors.title = 'Le titre du service est requis';
    }
    
    if (serviceData.duration <= 0) {
      newErrors.duration = 'La durée doit être supérieure à 0';
    }
    
    if (serviceData.price < 0) {
      newErrors.price = 'Le prix ne peut pas être négatif';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      ...serviceData,
      title: serviceData.title.trim(),
      description: serviceData.description.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-900 px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-lg font-medium text-white">Ajouter un service</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="space-y-4">
              {/* Titre */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du service <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={serviceData.title}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                  placeholder="Ex: Coupe femme, Balayage..."
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={serviceData.description}
                  onChange={handleChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                  placeholder="Décrivez brièvement ce service..."
                />
              </div>
              
              {/* Durée et Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    step="5"
                    value={serviceData.duration}
                    onChange={handleChange}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                  />
                  {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.5"
                    value={serviceData.price}
                    onChange={handleChange}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
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
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;