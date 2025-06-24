import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../components/LoadingSpinner';

// Define condition types
type Condition = {
  _id: string;
  name: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'managed';
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedBy?: string;
  treatment?: string;
  notes?: string;
};

type ConditionFormData = Omit<Condition, '_id'>;

const severityOptions = [
  { id: 'mild', name: 'Mild' },
  { id: 'moderate', name: 'Moderate' },
  { id: 'severe', name: 'Severe' },
];

const statusOptions = [
  { id: 'active', name: 'Active' },
  { id: 'managed', name: 'Managed' },
  { id: 'resolved', name: 'Resolved' },
];

const Conditions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [formData, setFormData] = useState<ConditionFormData>({
    name: '',
    diagnosisDate: new Date().toISOString().split('T')[0],
    status: 'active',
    severity: 'moderate',
    diagnosedBy: '',
    treatment: '',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const queryClient = useQueryClient();

  // Fetch conditions
  const { data: conditions, isLoading, error } = useQuery<Condition[]>(
    ['conditions'],
    async () => {
      const response = await axios.get('/api/health/conditions');
      return response.data;
    }
  );

  // Add new condition mutation
  const addConditionMutation = useMutation(
    (newCondition: ConditionFormData) => axios.post('/api/health/conditions', newCondition),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('conditions');
        setFormData({
          name: '',
          diagnosisDate: new Date().toISOString().split('T')[0],
          status: 'active',
          severity: 'moderate',
          diagnosedBy: '',
          treatment: '',
          notes: '',
        });
        setActiveTab('list');
      },
    }
  );

  // Update condition mutation
  const updateConditionMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Condition> }) => 
      axios.put(`/api/health/conditions/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('conditions');
      },
    }
  );

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addConditionMutation.mutate(formData);
  };

  // Update condition status
  const updateConditionStatus = (condition: Condition, newStatus: 'active' | 'managed' | 'resolved') => {
    updateConditionMutation.mutate({
      id: condition._id,
      data: { status: newStatus },
    });
  };

  // Filter conditions based on search term and status
  const filteredConditions = conditions?.filter(condition => {
    const matchesSearch = searchTerm === '' || 
      condition.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || condition.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) return <div className="p-4 text-red-500">Error loading conditions data</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Medical Conditions Tracker</h1>
      
      <div className="flex mb-4">
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('list')}
        >
          My Conditions
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('add')}
        >
          Add New Condition
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Medical Condition</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Condition Name
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
                <label className="block text-gray-700 mb-2" htmlFor="diagnosisDate">
                  Diagnosis Date
                </label>
                <input
                  id="diagnosisDate"
                  name="diagnosisDate"
                  type="date"
                  value={formData.diagnosisDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="severity">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {severityOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="diagnosedBy">
                  Diagnosed By (Optional)
                </label>
                <input
                  id="diagnosedBy"
                  name="diagnosedBy"
                  type="text"
                  value={formData.diagnosedBy}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Doctor or healthcare provider"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="treatment">
                  Treatment (Optional)
                </label>
                <input
                  id="treatment"
                  name="treatment"
                  type="text"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Current treatment plan"
                />
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
                placeholder="Additional information about the condition"
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={addConditionMutation.isLoading}
            >
              {addConditionMutation.isLoading ? 'Saving...' : 'Save Condition'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2">My Medical Conditions</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div>
                <input
                  type="text"
                  placeholder="Search conditions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="managed">Managed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
          
          {filteredConditions && filteredConditions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Condition</th>
                    <th className="py-2 px-4 text-left">Diagnosis Date</th>
                    <th className="py-2 px-4 text-left">Severity</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Treatment</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConditions.map((condition) => (
                    <tr key={condition._id} className="border-t">
                      <td className="py-2 px-4 font-medium">{condition.name}</td>
                      <td className="py-2 px-4">{new Date(condition.diagnosisDate).toLocaleDateString()}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          condition.severity === 'mild' ? 'bg-green-100 text-green-800' : 
                          condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {severityOptions.find(s => s.id === condition.severity)?.name}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          condition.status === 'active' ? 'bg-red-100 text-red-800' : 
                          condition.status === 'managed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {statusOptions.find(s => s.id === condition.status)?.name}
                        </span>
                      </td>
                      <td className="py-2 px-4">{condition.treatment || '-'}</td>
                      <td className="py-2 px-4">
                        <div className="flex space-x-2">
                          {condition.status !== 'active' && (
                            <button
                              onClick={() => updateConditionStatus(condition, 'active')}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                              title="Mark as Active"
                            >
                              Active
                            </button>
                          )}
                          {condition.status !== 'managed' && (
                            <button
                              onClick={() => updateConditionStatus(condition, 'managed')}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                              title="Mark as Managed"
                            >
                              Managed
                            </button>
                          )}
                          {condition.status !== 'resolved' && (
                            <button
                              onClick={() => updateConditionStatus(condition, 'resolved')}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                              title="Mark as Resolved"
                            >
                              Resolved
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No conditions match your search.' : 'No medical conditions recorded.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Conditions;