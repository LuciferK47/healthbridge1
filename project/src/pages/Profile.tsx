import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { User, Mail, Calendar, Droplet, Phone, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ success: boolean; data: UserProfile }>({
    queryKey: ['profile'],
    queryFn: () => axios.get('/health/profile').then(res => res.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserProfile>();

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<UserProfile>) =>
      axios.put('/health/profile', profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const onSubmit = (formData: UserProfile) => {
    updateProfileMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (data?.data) {
      reset(data.data);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (data?.data) {
      reset(data.data);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="bg-gray-200 h-96 rounded-lg"></div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">Failed to load profile data</span>
        </div>
      </div>
    );
  }

  const profile = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-6 pb-6 border-b border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  `${profile.firstName[0]}${profile.lastName[0]}`
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                  } ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                  } ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                  } border-gray-300`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  {...register('gender')}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                  } border-gray-300`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Blood Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplet className="w-4 h-4 inline mr-1" />
                  Blood Type
                </label>
                <select
                  {...register('bloodType')}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                  } border-gray-300`}
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    {...register('emergencyContact.name')}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } border-gray-300`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    {...register('emergencyContact.phone')}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } border-gray-300`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    {...register('emergencyContact.relationship')}
                    disabled={!isEditing}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } border-gray-300`}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}