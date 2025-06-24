import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  Pill,
  Activity,
  Calendar,
  Brain,
  AlertCircle,
  TrendingUp,
  Clock,
  Trash2,
  FileText,
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalConditions: number;
  totalMedications: number;
  totalAllergies: number;
  totalVitals: number;
  upcomingAppointments: number;
  recentAiSummaries: number;
}

interface RecentActivity {
  type: string;
  date: string;
  description: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface MedicalFile {
  _id: string;
  filename: string;
  originalName: string;
  path: string;
  uploadedAt: string;
}

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ['dashboard'],
    queryFn: () => axios.get('/user/dashboard').then((res) => res.data),
  });

  const {
    data: fileData,
    isLoading: loadingFiles,
    error: fileError,
  } = useQuery<MedicalFile[]>({
    queryKey: ['medical-files'],
    queryFn: () => axios.get('/medical-files/my-files').then((res) => res.data.files),
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => axios.delete(`/medical-files/${fileId}`),
    onSuccess: () => queryClient.invalidateQueries(['medical-files']),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">Failed to load dashboard data</span>
        </div>
      </div>
    );
  }

  const { stats, recentActivity, user } = data.data;

  const statCards = [
    {
      title: 'Medical Conditions',
      value: stats.totalConditions,
      icon: Heart,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Medications',
      value: stats.totalMedications,
      icon: Pill,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Vital Records',
      value: stats.totalVitals,
      icon: Activity,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vital':
        return Activity;
      case 'medication':
        return Pill;
      case 'ai_summary':
        return Brain;
      default:
        return Clock;
    }
  };

  const formatActivityDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-blue-100 text-lg">
              Here's an overview of your health journey
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <TrendingUp className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {activity.description}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {formatActivityDate(activity.date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-gray-400 text-sm">
                Start by adding your vitals or medications
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105">
              <Activity className="w-6 h-6 mb-2" />
              <span className="font-medium">Record Vitals</span>
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
              <Pill className="w-6 h-6 mb-2" />
              <span className="font-medium">Add Medication</span>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
              <Brain className="w-6 h-6 mb-2" />
              <span className="font-medium">AI Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Medical Files Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-500" />
            My Medical Files
          </h2>
        </div>
        <div className="p-6">
          {loadingFiles ? (
            <p className="text-gray-500">Loading files...</p>
          ) : fileError ? (
            <p className="text-red-500">Error loading files</p>
          ) : fileData && fileData.length > 0 ? (
            <ul className="space-y-4">
              {fileData.map((file) => (
                <li key={file._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{file.originalName}</p>
                    <p className="text-sm text-gray-500">Uploaded on {formatActivityDate(file.uploadedAt)}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(file._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No files uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
