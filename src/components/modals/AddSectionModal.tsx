import { useState } from 'react';

interface AddSectionModalProps {
  onClose: () => void;
  onSubmit: (title: string) => void;
}

const AddSectionModal = ({ onClose, onSubmit }: AddSectionModalProps) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      setError('Le titre de la section est requis');
      return;
    }
    
    onSubmit(title.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="bg-gray-900 px-6 py-4 rounded-t-lg">
          <h3 className="text-lg font-medium text-white">Ajouter une section</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre de la section
              </label>
              <input
                type="text"
                id="section-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500
"
                placeholder="Ex: Coupes femmes, Colorations..."
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
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

export default AddSectionModal;