import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client?: string;
  service?: string;
  notes?: string;
  staffId?: string;
  resourceId?: string;
  price?: number;
  clientPhone?: string;
}

interface RdvDetailsModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onRefresh?: () => void;
}

const RdvDetailsModal: React.FC<RdvDetailsModalProps> = ({ event, onClose, onRefresh }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editedData, setEditedData] = useState<Partial<CalendarEvent>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!event) return null;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      // Supprimer le rendez-vous de Firestore
      await deleteDoc(doc(db, 'rdvs', event.id));
      
      setSuccess('Le rendez-vous a été supprimé avec succès');
      
      // Fermer la modale après 1,5 secondes
      setTimeout(() => {
        if (onRefresh) onRefresh();
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Erreur lors de la suppression du rendez-vous:", err);
      setError("Impossible de supprimer le rendez-vous. Veuillez réessayer.");
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (type: 'start' | 'end', time: string) => {
    if (!event) return;
    
    const date = type === 'start' ? new Date(event.start) : new Date(event.end);
    const [hours, minutes] = time.split(':').map(Number);
    
    date.setHours(hours, minutes);
    
    setEditedData(prev => ({ ...prev, [type]: date }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedRdv = {
        ...(editedData.notes !== undefined && { notes: editedData.notes }),
        ...(editedData.client !== undefined && { clientName: editedData.client }),
        ...(editedData.clientPhone !== undefined && { clientPhone: editedData.clientPhone }),
        ...(editedData.start !== undefined && { start: editedData.start.toISOString() }),
        ...(editedData.end !== undefined && { end: editedData.end.toISOString() }),
        ...(editedData.staffId !== undefined && { staffId: editedData.staffId }),
        updatedAt: serverTimestamp()
      };
      
      // Mettre à jour le rendez-vous dans Firestore
      await updateDoc(doc(db, 'rdvs', event.id), updatedRdv);
      
      setSuccess('Le rendez-vous a été mis à jour avec succès');
      
      // Fermer le mode édition et rafraîchir après 1,5 secondes
      setTimeout(() => {
        setIsEditing(false);
        if (onRefresh) onRefresh();
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Erreur lors de la mise à jour du rendez-vous:", err);
      setError("Impossible de mettre à jour le rendez-vous. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // Fusionner les données originales avec les données modifiées
  const displayData = {
    ...event,
    ...editedData
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Modifier le rendez-vous' : 'Détails du rendez-vous'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-900 hover:text-gray-700"
            disabled={loading}
          >
            ✕
          </button>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <input
                  type="text"
                  name="client"
                  value={editedData.client || event.client || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={editedData.clientPhone || event.clientPhone || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <input
                  type="text"
                  value={event.service || ''}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Le service ne peut pas être modifié</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={format(displayData.start, 'dd/MM/yyyy', { locale: fr })}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">La date ne peut pas être modifiée</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coiffeur
                  </label>
                  <select
                    name="staffId"
                    value={editedData.staffId || event.staffId || ''}
                    onChange={handleInputChange}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                    disabled={loading}
                  >
                    <option value="bea">Béatrice</option>
                    <option value="cyrille">Cyrille</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={format(displayData.start, 'HH:mm')}
                    onChange={(e) => handleTimeChange('start', e.target.value)}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={format(displayData.end, 'HH:mm')}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={editedData.notes !== undefined ? editedData.notes : (event.notes || '')}
                  onChange={handleInputChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                  disabled={loading}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <div className="font-semibold">Client:</div>
                <div>{event.client}</div>
              </div>
              
              {event.clientPhone && (
                <div className="flex justify-between">
                  <div className="font-semibold">Téléphone:</div>
                  <div>{event.clientPhone}</div>
                </div>
              )}
              
              <div className="flex justify-between">
                <div className="font-semibold">Service:</div>
                <div>{event.service}</div>
              </div>
              
              <div className="flex justify-between">
                <div className="font-semibold">Date:</div>
                <div>{format(event.start, 'dd MMMM yyyy', { locale: fr })}</div>
              </div>
              
              <div className="flex justify-between">
                <div className="font-semibold">Horaire:</div>
                <div>
                  {format(event.start, 'HH:mm', { locale: fr })} - {format(event.end, 'HH:mm', { locale: fr })}
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="font-semibold">Coiffeur:</div>
                <div>
                  {event.staffId === 'bea' ? 'Béatrice' : 
                   event.staffId === 'cyrille' ? 'Cyrille' : event.staffId}
                </div>
              </div>
              
              {event.price !== undefined && (
                <div className="flex justify-between">
                  <div className="font-semibold">Prix:</div>
                  <div>{event.price} €</div>
                </div>
              )}
              
              {event.notes && (
                <div className="pt-2">
                  <div className="font-semibold mb-1">Notes:</div>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-700">{event.notes}</div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between space-x-3 pt-4 border-t">
              {confirmDelete ? (
                <>
                  <div className="text-red-600 flex-grow text-center py-2">
                    Êtes-vous sûr ?
                  </div>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={isDeleting}
                  >
                    Non
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  >
                    Modifier
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RdvDetailsModal;