import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2025-06-01', heartRate: 72, bloodPressure: 120 },
  { date: '2025-06-02', heartRate: 75, bloodPressure: 122 },
  // Add more dummy/fetched data
];

const VitalsChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="heartRate" stroke="#8884d8" />
      <Line type="monotone" dataKey="bloodPressure" stroke="#82ca9d" />
    </LineChart>
  </ResponsiveContainer>
);

export default VitalsChart;
