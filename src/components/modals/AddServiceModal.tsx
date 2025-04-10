import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface ServiceData {
  title: string;
  description: string;
  duration: string; // format HH:mm
  price: string;
}

interface AddServiceModalProps {
  onClose: () => void;
  onSubmit: (serviceData: ServiceData) => void;
  sectionId: string;
}

const AddServiceModal = ({ onClose, onSubmit, sectionId }: AddServiceModalProps) => {
  const [serviceData, setServiceData] = useState<ServiceData>({
    title: '',
    description: '',
    duration: '00:30',
    price: '0'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ServiceData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServiceData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof ServiceData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof ServiceData, string>> = {};

    if (!serviceData.title.trim()) {
      newErrors.title = 'Le titre du service est requis';
    }

    const [hoursStr, minutesStr] = serviceData.duration.split(':');
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    const totalDuration = (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);

    if (totalDuration <= 0) {
      newErrors.duration = 'La durée doit être supérieure à 0 minute';
    }

    const price = parseFloat(serviceData.price);
    if (isNaN(price) || price < 0) {
      newErrors.price = 'Le prix ne peut pas être négatif';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const serviceToAdd = {
        title: serviceData.title.trim(),
        description: serviceData.description.trim(),
        duration: totalDuration,
        price: price,
        sectionId: sectionId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const servicesRef = collection(db, 'services');
      await addDoc(servicesRef, serviceToAdd);

      onSubmit(serviceData);
    } catch (err) {
      console.error("Erreur lors de l'ajout du service:", err);
      setErrors(prev => ({ ...prev, title: "Une erreur est survenue lors de l'enregistrement" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-800 px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-lg font-medium text-white">Ajouter un service</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Titre du service <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={serviceData.title}
                onChange={handleChange}
                className="w-full border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-800"
                placeholder="Ex: Coupe femme, Balayage..."
                disabled={isSubmitting}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={serviceData.description}
                onChange={handleChange}
                className="w-full min-h-[80px] border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-800"
                placeholder="Décrivez brièvement ce service..."
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                Durée <span className="text-red-500">*</span>
              </Label>
              <input
                type="time"
                id="duration"
                name="duration"
                step="300"
                value={serviceData.duration}
                onChange={handleChange}
                className="w-full bg-white px-3 py-2 border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                disabled={isSubmitting}
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Prix (€) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="price"
                name="price"
                value={serviceData.price}
                onChange={handleChange}
                className="w-full border border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-800"
                disabled={isSubmitting}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-800 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-0"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;