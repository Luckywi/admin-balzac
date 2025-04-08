import { useState } from 'react';

interface DispoStaffProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
}

interface WorkHours {
  start: string;
  end: string;
}

interface Break {
  id: string;
  day: string;
  start: string;
  end: string;
}

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  description: string;
}

const DAYS_OF_WEEK = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche'
];

const DEFAULT_WORK_HOURS: Record<string, WorkHours> = {
  'Lundi': { start: '09:00', end: '18:00' },
  'Mardi': { start: '09:00', end: '18:00' },
  'Mercredi': { start: '09:00', end: '18:00' },
  'Jeudi': { start: '09:00', end: '18:00' },
  'Vendredi': { start: '09:00', end: '18:00' },
  'Samedi': { start: '09:00', end: '14:00' },
  'Dimanche': { start: '10:00', end: '13:00' } // Ajout d'horaires par défaut pour le dimanche
};

const DispoStaff = ({ isOpen, onClose, staffId, staffName }: DispoStaffProps) => {
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({
    'Lundi': true,
    'Mardi': true,
    'Mercredi': true,
    'Jeudi': true,
    'Vendredi': true,
    'Samedi': true,
    'Dimanche': false
  });

  const [workHours, setWorkHours] = useState<Record<string, WorkHours>>(DEFAULT_WORK_HOURS);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [activeTab, setActiveTab] = useState<'horaires' | 'pauses' | 'vacances'>('horaires');
  
  // Pour l'ajout de pause
  const [newBreak, setNewBreak] = useState<Omit<Break, 'id'>>({
    day: 'Lundi',
    start: '12:00',
    end: '13:00'
  });
  
  // Pour l'ajout de vacances
  const [newVacation, setNewVacation] = useState<Omit<Vacation, 'id'>>({
    startDate: '',
    endDate: '',
    description: ''
  });

  // Gestion des jours travaillés
  const handleWorkDayChange = (day: string) => {
    setWorkDays(prev => {
      const newWorkDays = { ...prev, [day]: !prev[day] };
      
      // Si on active un jour, on met des heures par défaut
      if (newWorkDays[day]) {
        setWorkHours(prev => ({
          ...prev,
          [day]: DEFAULT_WORK_HOURS[day]
        }));
      }
      
      return newWorkDays;
    });
  };

  // Gestion des horaires de travail
  const handleWorkHoursChange = (day: string, field: 'start' | 'end', value: string) => {
    setWorkHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // Ajout d'une pause
  const handleAddBreak = () => {
    const id = `break-${Date.now()}`;
    setBreaks([...breaks, { ...newBreak, id }]);
    
    // Réinitialiser le formulaire
    setNewBreak({
      day: 'Lundi',
      start: '12:00',
      end: '13:00'
    });
  };

  // Suppression d'une pause
  const handleDeleteBreak = (id: string) => {
    setBreaks(breaks.filter(item => item.id !== id));
  };

  // Ajout d'une période de vacances
  const handleAddVacation = () => {
    if (!newVacation.startDate || !newVacation.endDate) return;
    
    const id = `vacation-${Date.now()}`;
    setVacations([...vacations, { ...newVacation, id }]);
    
    // Réinitialiser le formulaire
    setNewVacation({
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  // Suppression d'une période de vacances
  const handleDeleteVacation = (id: string) => {
    setVacations(vacations.filter(item => item.id !== id));
  };

  // Enregistrement des modifications
  const handleSave = () => {
    // Ici vous pourriez envoyer les données à votre backend
    console.log({
      staffId,
      workDays,
      workHours,
      breaks,
      vacations
    });
    
    // Fermer la modale
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="bg-gray-900 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            Disponibilités de {staffName}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Onglets */}
        <div className="bg-gray-50 px-6 py-2 border-b">
          <div className="flex space-x-4">
            <button 
              className={`py-2 px-4 font-medium rounded-t-md transition-colors ${activeTab === 'horaires' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('horaires')}
            >
              Horaires
            </button>
            <button 
              className={`py-2 px-4 font-medium rounded-t-md transition-colors ${activeTab === 'pauses' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('pauses')}
            >
              Pauses
            </button>
            <button 
              className={`py-2 px-4 font-medium rounded-t-md transition-colors ${activeTab === 'vacances' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('vacances')}
            >
              Vacances
            </button>
          </div>
        </div>
        
        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {/* Onglet Horaires */}
          {activeTab === 'horaires' && (
            <div>
              <p className="mb-4 text-gray-600">
                Définissez les jours travaillés et les horaires pour chaque jour.
              </p>
              
              <div className="space-y-4 mt-6">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="flex flex-wrap md:flex-nowrap items-center gap-4 py-3 border-b border-gray-200">
                    <div className="w-full md:w-36 flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={workDays[day]}
                          onChange={() => handleWorkDayChange(day)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 border-2 border-gray-900 
  peer-checked:border-2 peer-checked:border-transparent
  peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 
  rounded-full peer relative transition-colors
  peer-checked:bg-gray-900 
  after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
  after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
  after:border-2 after:border-gray-900 peer-checked:after:border-white 
  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full">
</div>


                        <span className="ms-3 text-gray-900 font-medium">{day}</span>
                      </label>
                    </div>
                    
                    {workDays[day] && (
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div>
                          <label htmlFor={`start-${day}`} className="block text-sm text-gray-600 mb-1">
                            Début
                          </label>
                          <input
                            type="time"
                            id={`start-${day}`}
                            value={workHours[day]?.start || ''}
                            onChange={(e) => handleWorkHoursChange(day, 'start', e.target.value)}
                            className="inline-block border border-gray-900 rounded-md px-2 py-1 text-center text-gray-900 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 w-auto"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`end-${day}`} className="block text-sm text-gray-600 mb-1">
                            Fin
                          </label>
                          <input
                            type="time"
                            id={`end-${day}`}
                            value={workHours[day]?.end || ''}
                            onChange={(e) => handleWorkHoursChange(day, 'end', e.target.value)}
                            className="inline-block border border-gray-900 rounded-md px-2 py-1 text-center text-gray-900 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 w-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Onglet Pauses */}
          {activeTab === 'pauses' && (
            <div>
              <p className="mb-4 text-gray-600">
                Ajoutez des pauses régulières pour chaque jour de la semaine.
              </p>
              
              {/* Formulaire d'ajout de pause */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Ajouter une pause</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Jour</label>
                    <select
                      value={newBreak.day}
                      onChange={(e) => setNewBreak({...newBreak, day: e.target.value})}
                      className="inline-block border border-gray-900 rounded-md px-2 py-1 text-center text-gray-900 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 w-auto"
                    >
                      {DAYS_OF_WEEK.filter(day => workDays[day]).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Début</label>
                    <input
                      type="time"
                      value={newBreak.start}
                      onChange={(e) => setNewBreak({...newBreak, start: e.target.value})}
                      className="inline-block border border-gray-900 rounded-md px-2 py-1 text-center text-gray-900 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 w-auto"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Fin</label>
                    <input
                      type="time"
                      value={newBreak.end}
                      onChange={(e) => setNewBreak({...newBreak, end: e.target.value})}
                      className="inline-block border border-gray-900 rounded-md px-2 py-1 text-center text-gray-900 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 w-auto"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleAddBreak}
                  className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Ajouter cette pause
                </button>
              </div>
              
              {/* Liste des pauses */}
              {breaks.length > 0 ? (
                <div className="overflow-x-auto mt-6 rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jour
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Début
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {breaks.map(breakItem => (
                        <tr key={breakItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {breakItem.day}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {breakItem.start}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {breakItem.end}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteBreak(breakItem.id)}
                              className="text-red-600 hover:text-red-900 focus:outline-none"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500 bg-gray-50 rounded-lg mt-4 border border-gray-200">
                  Aucune pause configurée
                </div>
              )}
            </div>
          )}
          
          {/* Onglet Vacances */}
          {activeTab === 'vacances' && (
            <div>
              <p className="mb-4 text-gray-600">
                Définissez les périodes de vacances ou d'absence.
              </p>
              
              {/* Formulaire d'ajout de vacances */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Ajouter une période d'absence</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date de début</label>
                    <input
                      type="date"
                      value={newVacation.startDate}
                      onChange={(e) => setNewVacation({...newVacation, startDate: e.target.value})}
                      className="inline-block border border-gray-900 rounded-md px-2 py-1 text-center text-gray-900 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 w-auto"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={newVacation.endDate}
                      onChange={(e) => setNewVacation({...newVacation, endDate: e.target.value})}
                      className="inline-block border border-gray-900 rounded-md px-2 py-1 text-center text-gray-900 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 w-auto"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="Congés, formation, etc."
                      value={newVacation.description}
                      onChange={(e) => setNewVacation({...newVacation, description: e.target.value})}
                      className="inline-block border border-gray-900 rounded-md px-2 py-1 text-center text-gray-900 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 w-auto"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleAddVacation}
                  className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={!newVacation.startDate || !newVacation.endDate}
                >
                  Ajouter cette période
                </button>
              </div>
              
              {/* Liste des vacances */}
              {vacations.length > 0 ? (
                <div className="overflow-x-auto mt-6 rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Début
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vacations.map(vacation => (
                        <tr key={vacation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(vacation.startDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(vacation.endDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vacation.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteVacation(vacation.id)}
                              className="text-red-600 hover:text-red-900 focus:outline-none"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500 bg-gray-50 rounded-lg mt-4 border border-gray-200">
                  Aucune période d'absence configurée
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer avec boutons */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispoStaff;