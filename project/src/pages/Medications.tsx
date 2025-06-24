import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../components/LoadingSpinner';

// Define medication types
type Medication = {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  purpose: string;
  prescribedBy?: string;
  notes?: string;
  active: boolean;
};

type MedicationFormData = Omit<Medication, '_id' | 'active'> & {
  active: boolean;
};

const frequencyOptions = [
  { id: 'once-daily', name: 'Once Daily' },
  { id: 'twice-daily', name: 'Twice Daily' },
  { id: 'three-times-daily', name: 'Three Times Daily' },
  { id: 'four-times-daily', name: 'Four Times Daily' },
  { id: 'as-needed', name: 'As Needed' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'other', name: 'Other (specify in notes)' },
];

const Medications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'add' | 'history'>('current');
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    dosage: '',
    frequency: 'once-daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    purpose: '',
    prescribedBy: '',
    notes: '',
    active: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(true);

  const queryClient = useQueryClient();

  // Fetch medications
  const { data: medications, isLoading, error } = useQuery<Medication[]>(
    ['medications'],
    async () => {
      const response = await axios.get('/api/health/medications');
      return response.data;
    }
  );

  // Add new medication mutation
  const addMedicationMutation = useMutation(
    (newMedication: MedicationFormData) => axios.post('/api/health/medications', newMedication),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('medications');
        setFormData({
          name: '',
          dosage: '',
          frequency: 'once-daily',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          purpose: '',
          prescribedBy: '',
          notes: '',
          active: true,
        });
        setActiveTab('current');
      },
    }
  );

  // Update medication mutation
  const updateMedicationMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Medication> }) => 
      axios.put(`/api/health/medications/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('medications');
      },
    }
  );

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addMedicationMutation.mutate(formData);
  };

  // Toggle medication active status
  const toggleMedicationStatus = (medication: Medication) => {
    updateMedicationMutation.mutate({
      id: medication._id,
      data: { active: !medication.active },
    });
  };

  // Filter medications based on search term and active status
  const filteredMedications = medications?.filter(med => {
    const matchesSearch = searchTerm === '' || 
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActiveFilter = filterActive === null || med.active === filterActive;
    
    return matchesSearch && matchesActiveFilter;
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) return <div className="p-4 text-red-500">Error loading medications data</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Medications Tracker</h1>
      
      <div className="flex mb-4">
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('current')}
        >
          Current Medications
        </button>
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('history')}
        >
          Medication History
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('add')}
        >
          Add New Medication
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Medication</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Medication Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="dosage">
                  Dosage
                </label>
                <input
                  id="dosage"
                  name="dosage"
                  type="text"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., 10mg, 1 tablet"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="frequency">
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {frequencyOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="purpose">
                  Purpose
                </label>
                <input
                  id="purpose"
                  name="purpose"
                  type="text"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="startDate">
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="endDate">
                  End Date (Optional)
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="prescribedBy">
                  Prescribed By (Optional)
                </label>
                <input
                  id="prescribedBy"
                  name="prescribedBy"
                  type="text"
                  value={formData.prescribedBy}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center text-gray-700 mb-2" htmlFor="active">
                  <input
                    id="active"
                    name="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Currently Taking
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="notes">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={addMedicationMutation.isLoading}
            >
              {addMedicationMutation.isLoading ? 'Saving...' : 'Save Medication'}
            </button>
          </form>
        </div>
      )}

      {(activeTab === 'current' || activeTab === 'history') && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2">
                {activeTab === 'current' ? 'Current Medications' : 'Medication History'}
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div>
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <select
                  value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
                  onChange={(e) => {
                    if (e.target.value === 'all') setFilterActive(null);
                    else setFilterActive(e.target.value === 'active');
                  }}
                  className="p-2 border rounded w-full"
                >
                  <option value="all">All Medications</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>
          
          {filteredMedications && filteredMedications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Medication</th>
                    <th className="py-2 px-4 text-left">Dosage</th>
                    <th className="py-2 px-4 text-left">Frequency</th>
                    <th className="py-2 px-4 text-left">Purpose</th>
                    <th className="py-2 px-4 text-left">Start Date</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedications.map((medication) => (
                    <tr key={medication._id} className="border-t">
                      <td className="py-2 px-4 font-medium">{medication.name}</td>
                      <td className="py-2 px-4">{medication.dosage}</td>
                      <td className="py-2 px-4">
                        {frequencyOptions.find(f => f.id === medication.frequency)?.name || medication.frequency}
                      </td>
                      <td className="py-2 px-4">{medication.purpose}</td>
                      <td className="py-2 px-4">{new Date(medication.startDate).toLocaleDateString()}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${medication.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {medication.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => toggleMedicationStatus(medication)}
                          className={`px-3 py-1 rounded text-xs ${medication.active ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                        >
                          {medication.active ? 'Discontinue' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No medications match your search.' : 'No medications found.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Medications;