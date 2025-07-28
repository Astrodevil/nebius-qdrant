import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  Database, 
  Target, 
  Users, 
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dataAPI } from '../services/api';

const DataUpload = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

  const { data: companyData, isLoading } = useQuery('companyData', dataAPI.getCompanyData, {
    retry: false,
    onError: () => {
      // Company data not available, continue without it
    }
  });

  const uploadMutation = useMutation(dataAPI.uploadCompanyData, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('companyData');
      queryClient.invalidateQueries('dataStats');
      toast.success('Company data uploaded successfully!');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error('Failed to upload company data');
    }
  });

  const updateMutation = useMutation(dataAPI.updateCompanyData, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('companyData');
      queryClient.invalidateQueries('dataStats');
      toast.success('Company data updated successfully!');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error('Failed to update company data');
    }
  });

  const deleteMutation = useMutation(dataAPI.deleteCompanyData, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('companyData');
      queryClient.invalidateQueries('dataStats');
      toast.success('Company data deleted successfully!');
      reset();
    },
    onError: (error) => {
      toast.error('Failed to delete company data');
    }
  });

  const onSubmit = (data) => {
    const payload = {
      companyData: {
        description: data.description,
        goals: data.goals ? data.goals.split('\n').filter(g => g.trim()) : [],
        targets: data.targets ? data.targets.split('\n').filter(t => t.trim()) : [],
        products: data.products ? data.products.split('\n').filter(p => p.trim()) : [],
        industry: data.industry,
        values: data.values ? data.values.split('\n').filter(v => v.trim()) : []
      }
    };

    if (companyData?.data) {
      updateMutation.mutate(payload);
    } else {
      uploadMutation.mutate(payload);
    }
  };

  const handleEdit = () => {
    if (companyData?.data) {
      reset({
        description: companyData.data.description,
        goals: companyData.data.goals?.join('\n') || '',
        targets: companyData.data.targets?.join('\n') || '',
        products: companyData.data.products?.join('\n') || '',
        industry: companyData.data.industry || '',
        values: companyData.data.values?.join('\n') || ''
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete all company data? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Upload</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage your company data for AI-powered content suggestions
          </p>
        </div>
        
        {companyData?.data && !isEditing && (
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="btn-secondary flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Data
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Status Card */}
      {companyData?.data && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-900">Company Data Loaded</h3>
              <p className="text-green-700 text-sm">
                {companyData.data.vectorCount} vectors created • Last updated: {new Date(companyData.data.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {companyData?.data ? (isEditing ? 'Edit Company Data' : 'Company Data') : 'Upload Company Data'}
          </h2>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          )}
        </div>

        {companyData?.data && !isEditing ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Company Description</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{companyData.data.description}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Goals</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                {companyData.data.goals?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {companyData.data.goals.map((goal, index) => (
                      <li key={index} className="text-gray-700">{goal}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No goals specified</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Target Audiences</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                {companyData.data.targets?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {companyData.data.targets.map((target, index) => (
                      <li key={index} className="text-gray-700">{target}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No targets specified</p>
                )}
              </div>
            </div>

            {companyData.data.products?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Products/Services</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    {companyData.data.products.map((product, index) => (
                      <li key={index} className="text-gray-700">{product}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {companyData.data.industry && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Industry</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{companyData.data.industry}</p>
              </div>
            )}

            {companyData.data.values?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Company Values</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    {companyData.data.values.map((value, index) => (
                      <li key={index} className="text-gray-700">{value}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description *
              </label>
              <textarea
                {...register('description', { required: 'Company description is required' })}
                rows={4}
                className="textarea-field"
                placeholder="Describe your company, what you do, your mission, and key differentiators..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Goals (one per line)
              </label>
              <textarea
                {...register('goals')}
                rows={4}
                className="textarea-field"
                placeholder="Enter your company goals, objectives, and what you want to achieve..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audiences (one per line)
              </label>
              <textarea
                {...register('targets')}
                rows={3}
                className="textarea-field"
                placeholder="Who are your target customers, audiences, or markets..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products/Services (one per line)
              </label>
              <textarea
                {...register('products')}
                rows={3}
                className="textarea-field"
                placeholder="List your main products, services, or offerings..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                {...register('industry')}
                type="text"
                className="input-field"
                placeholder="e.g., Technology, Healthcare, Finance, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Values (one per line)
              </label>
              <textarea
                {...register('values')}
                rows={3}
                className="textarea-field"
                placeholder="What are your company values, principles, or culture..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploadMutation.isLoading || updateMutation.isLoading}
                className="btn-primary flex items-center"
              >
                {uploadMutation.isLoading || updateMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {companyData?.data ? 'Updating...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {companyData?.data ? 'Update Data' : 'Upload Data'}
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Data Processing Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <Database className="h-6 w-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900">Data Processing</h3>
            <p className="text-blue-700 text-sm mt-1">
              Your company data will be processed and converted into vector embeddings stored in Qdrant. 
              This enables the AI to understand your business context and generate more relevant content suggestions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload; 