import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ServiceData {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  sectionId?: string;
}

interface EditServiceModalProps {
  onClose: () => void;
  onSubmit: (serviceData: Omit<ServiceData, 'id'>) => void;
  currentService: ServiceData;
  serviceId: string; // Nouvelle propriété
}

const EditServiceModal = ({ onClose, onSubmit, currentService, serviceId }: EditServiceModalProps) => {
  const [serviceData, setServiceData] = useState<Omit<ServiceData, 'id'>>({
    title: currentService.title,
    description: currentService.description,
    duration: currentService.duration,
    price: currentService.price,
    sectionId: currentService.sectionId
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<ServiceData, 'id'>, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mettre à jour les données si currentService change
  useEffect(() => {
    setServiceData({
      title: currentService.title,
      description: currentService.description,
      duration: currentService.duration,
      price: currentService.price,
      sectionId: currentService.sectionId
    });
  }, [currentService]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setServiceData({
      ...serviceData,
      [name]: name === 'duration' || name === 'price' 
        ? parseFloat(value) || 0
        : value
    });
    
    // Effacer l'erreur pour ce champ
    if (errors[name as keyof Omit<ServiceData, 'id'>]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Partial<Record<keyof Omit<ServiceData, 'id'>, string>> = {};
    
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
    
    try {
      setIsSubmitting(true);
      
      // Données à mettre à jour
      const updatedService = {
        title: serviceData.title.trim(),
        description: serviceData.description.trim(),
        duration: serviceData.duration,
        price: serviceData.price,
        updatedAt: serverTimestamp()
      };
      
      // Mise à jour dans Firestore
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, updatedService);
      
      // Succès, appel du callback et fermeture
      onSubmit(serviceData);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du service:", err);
      setErrors({
        ...errors,
        title: "Une erreur est survenue lors de l'enregistrement"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-900 px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-lg font-medium text-white">Modifier le service</h3>
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
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  disabled={isSubmitting}
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
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  disabled={isSubmitting}
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
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    disabled={isSubmitting}
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
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;