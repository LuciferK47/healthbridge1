import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import LoadingSpinner from '../components/LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define vital sign types
type VitalSign = {
  _id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
  notes?: string;
};

type VitalFormData = {
  type: string;
  value: number;
  unit: string;
  notes: string;
};

const vitalTypes = [
  { id: 'bloodPressure', name: 'Blood Pressure', unit: 'mmHg' },
  { id: 'heartRate', name: 'Heart Rate', unit: 'bpm' },
  { id: 'temperature', name: 'Temperature', unit: '°C' },
  { id: 'respiratoryRate', name: 'Respiratory Rate', unit: 'breaths/min' },
  { id: 'oxygenSaturation', name: 'Oxygen Saturation', unit: '%' },
  { id: 'weight', name: 'Weight', unit: 'kg' },
  { id: 'bloodGlucose', name: 'Blood Glucose', unit: 'mg/dL' },
];

const Vitals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'history'>('history');
  const [selectedVitalType, setSelectedVitalType] = useState<string>('heartRate');
  const [formData, setFormData] = useState<VitalFormData>({
    type: 'heartRate',
    value: 0,
    unit: 'bpm',
    notes: '',
  });
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
  });

  const queryClient = useQueryClient();

  // Fetch vital signs
  const { data: vitals, isLoading, error } = useQuery<VitalSign[]>(
    ['vitals', dateRange],
    async () => {
      const response = await axios.get('/api/health/vitals', {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });
      return response.data;
    }
  );

  // Add new vital sign mutation
  const addVitalMutation = useMutation(
    (newVital: VitalFormData) => axios.post('/api/health/vitals', newVital),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vitals');
        setFormData({
          type: 'heartRate',
          value: 0,
          unit: 'bpm',
          notes: '',
        });
        setActiveTab('history');
      },
    }
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      const selectedType = vitalTypes.find(type => type.id === value);
      setFormData({
        ...formData,
        [name]: value,
        unit: selectedType?.unit || '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'value' ? parseFloat(value) : value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVitalMutation.mutate(formData);
  };

  // Filter vitals by type for chart
  const filteredVitals = vitals?.filter(vital => vital.type === selectedVitalType) || [];
  
  // Prepare chart data
  const chartData = {
    labels: filteredVitals.map(vital => new Date(vital.date).toLocaleDateString()),
    datasets: [
      {
        label: vitalTypes.find(type => type.id === selectedVitalType)?.name || '',
        data: filteredVitals.map(vital => vital.value),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${vitalTypes.find(type => type.id === selectedVitalType)?.name || ''} History`,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: vitalTypes.find(type => type.id === selectedVitalType)?.unit || '',
        },
      },
    },
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) return <div className="p-4 text-red-500">Error loading vital signs data</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Vital Signs Tracker</h1>
      
      <div className="flex mb-4">
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('history')}
        >
          History & Trends
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('add')}
        >
          Add New Vital Sign
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Record New Vital Sign</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="type">
                Vital Sign Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                {vitalTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="value">
                Value
              </label>
              <div className="flex">
                <input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-l"
                  required
                />
                <span className="bg-gray-100 p-2 border border-l-0 rounded-r">
                  {formData.unit}
                </span>
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
              disabled={addVitalMutation.isLoading}
            >
              {addVitalMutation.isLoading ? 'Saving...' : 'Save Vital Sign'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2">Vital Signs History</h2>
              <div className="flex items-center">
                <label className="mr-2">View:</label>
                <select
                  value={selectedVitalType}
                  onChange={(e) => setSelectedVitalType(e.target.value)}
                  className="p-2 border rounded"
                >
                  {vitalTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row">
              <div className="mr-4 mb-2 sm:mb-0">
                <label className="block text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="p-2 border rounded"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6 h-64">
            {filteredVitals.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <p className="text-gray-500">No data available for the selected vital sign type</p>
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Value</th>
                  <th className="py-2 px-4 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredVitals.length > 0 ? (
                  filteredVitals.map((vital) => (
                    <tr key={vital._id} className="border-t">
                      <td className="py-2 px-4">{new Date(vital.date).toLocaleDateString()}</td>
                      <td className="py-2 px-4">{vitalTypes.find(type => type.id === vital.type)?.name}</td>
                      <td className="py-2 px-4">
                        {vital.value} {vital.unit}
                      </td>
                      <td className="py-2 px-4">{vital.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No vital signs recorded for this type
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vitals;