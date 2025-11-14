'use client';

import { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  PlusIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  plan: string;
  max_users: number;
  max_devices: number;
  is_active: number;
  created_at: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    plan: 'free'
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/organizations/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/organizations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setFormData({ name: '', slug: '', description: '', plan: 'free' });
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  const getPlanConfig = (plan: string) => {
    const configs: any = {
      free: {
        badge: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800',
        icon: '🆓',
        gradient: 'from-gray-400 to-gray-600'
      },
      pro: {
        badge: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800',
        icon: '⚡',
        gradient: 'from-blue-500 to-cyan-500'
      },
      enterprise: {
        badge: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800',
        icon: '👑',
        gradient: 'from-purple-500 to-pink-500'
      }
    };
    return configs[plan] || configs.free;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-500 mx-auto"></div>
            <BuildingOfficeIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-purple-400" />
          </div>
          <p className="mt-6 text-purple-300 text-lg font-semibold">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Animated Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
                    <BuildingOfficeIcon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black text-white tracking-tight">Organizations</h1>
                    <p className="text-purple-100 text-lg mt-2">Build and manage your teams</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <PlusIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Create Organization</span>
                  <SparklesIcon className="h-5 w-5 animate-pulse" />
                </div>
              </button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Organizations Grid */}
        {organizations.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 backdrop-blur-xl rounded-3xl border-2 border-purple-500/20 shadow-2xl">
            <div className="relative inline-block">
              <BuildingOfficeIcon className="h-24 w-24 text-purple-400/50 mx-auto mb-6" />
              <RocketLaunchIcon className="absolute -top-2 -right-2 h-10 w-10 text-pink-400 animate-bounce" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">No Organizations Yet</h3>
            <p className="text-purple-300 text-lg mb-8 max-w-md mx-auto">
              Start your journey by creating your first organization
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <PlusIcon className="h-6 w-6" />
                <span>Create Your First Organization</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org, index) => {
              const planConfig = getPlanConfig(org.plan);
              return (
                <div
                  key={org.id}
                  className="group relative bg-slate-800/80 backdrop-blur-xl rounded-3xl border-2 border-purple-500/20 hover:border-purple-500/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${planConfig.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Card Header */}
                  <div className="relative p-6 border-b border-slate-700/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {org.name}
                        </h3>
                        <p className="text-purple-400 text-sm font-mono">@{org.slug}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${planConfig.badge} flex items-center space-x-2 shadow-lg`}>
                        <span>{planConfig.icon}</span>
                        <span>{org.plan.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    {org.description && (
                      <p className="text-slate-300 text-sm leading-relaxed">{org.description}</p>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserGroupIcon className="h-5 w-5 text-blue-400" />
                          <span className="text-xs text-slate-400 font-semibold">MAX USERS</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{org.max_users}</p>
                      </div>

                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Cog6ToothIcon className="h-5 w-5 text-purple-400" />
                          <span className="text-xs text-slate-400 font-semibold">DEVICES</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{org.max_devices}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-900/30 rounded-xl border border-slate-700/30">
                      <span className="text-slate-400 text-sm font-semibold">Status</span>
                      <div className="flex items-center space-x-2">
                        {org.is_active ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 text-green-400 animate-pulse" />
                            <span className="text-green-400 font-bold text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <span className="text-red-400 font-bold text-sm">Inactive</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Created date */}
                    <div className="pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-slate-500">
                        Created {new Date(org.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="relative bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-700/50">
                    <button className="flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                      <UserGroupIcon className="h-5 w-5" />
                      <span>Manage Team</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all">
                        <Cog6ToothIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-purple-500/30 animate-scale-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 backdrop-blur-lg rounded-xl">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Create Organization</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <XCircleIcon className="h-7 w-7" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateOrganization} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-3">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-3">
                    Slug * <span className="text-slate-500 font-normal">(URL-friendly identifier)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all font-mono"
                    placeholder="acme-corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-3">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all resize-none"
                    rows={3}
                    placeholder="Brief description of your organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-3">
                    Plan
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="free">🆓 Free - Get started</option>
                    <option value="pro">⚡ Pro - Advanced features</option>
                    <option value="enterprise">👑 Enterprise - Unlimited power</option>
                  </select>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border-2 border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}