'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: any;
  is_system: number;
}

interface RoleStats {
  name: string;
  display_name: string;
  user_count: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<RoleStats[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/roles/`);
      const data = await response.json();
      
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/roles/stats/usage`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRoleBadge = (name: string) => {
    const badges: any = {
      admin: 'bg-red-100 text-red-800 ring-red-200',
      manager: 'bg-blue-100 text-blue-800 ring-blue-200',
      analyst: 'bg-green-100 text-green-800 ring-green-200',
      viewer: 'bg-gray-100 text-gray-800 ring-gray-200'
    };
    return badges[name] || 'bg-purple-100 text-purple-800 ring-purple-200';
  };

  const getPermissionCount = (permissions: any) => {
    if (!permissions) return 0;
    if (permissions.all) return '∞';
    
    let count = 0;
    Object.values(permissions).forEach((actions: any) => {
      if (Array.isArray(actions)) count += actions.length;
    });
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheckIcon className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Roles & Permissions</h1>
          </div>
          <p className="text-blue-100 text-lg">Manage role-based access control</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase">{stat.display_name}</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{stat.user_count}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">users assigned</p>
            </div>
          ))}
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200"
            >
              {/* Role Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ring-2 ${getRoleBadge(role.name)}`}>
                        {role.name.toUpperCase()}
                      </span>
                      {role.is_system === 1 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{role.display_name}</h3>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-black text-blue-600">
                      {getPermissionCount(role.permissions)}
                    </div>
                    <p className="text-xs text-gray-500">permissions</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>

              {/* Permissions Preview */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                  <KeyIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Permissions
                </h4>
                
                {role.permissions?.all ? (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      <span className="font-bold text-green-900">Full Access - All Permissions</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(role.permissions || {}).map(([resource, actions]: [string, any]) => (
                      <div key={resource} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-semibold text-gray-900 capitalize">{resource}</span>
                        <div className="flex items-center space-x-1">
                          {Array.isArray(actions) ? actions.map((action: string) => (
                            <span key={action} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              {action}
                            </span>
                          )) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <button
                  onClick={() => setSelectedRole(role)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View Details
                </button>
                <button className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-800 font-semibold">
                  <ArrowsRightLeftIcon className="h-4 w-4" />
                  <span>Compare</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Role Details Modal */}
        {selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedRole.display_name}</h2>
                    <p className="text-blue-100 mt-1">{selectedRole.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="text-white hover:text-gray-200"
                  >
                    <XCircleIcon className="h-8 w-8" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Full Permissions List</h3>
                  
                  {selectedRole.permissions?.all ? (
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        <span className="text-xl font-bold text-green-900">Administrator Access</span>
                      </div>
                      <p className="text-green-700">This role has unrestricted access to all system features and resources.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(selectedRole.permissions || {}).map(([resource, actions]: [string, any]) => (
                        <div key={resource} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <h4 className="text-lg font-bold text-gray-900 capitalize mb-3">{resource}</h4>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(actions) ? actions.map((action: string) => (
                              <div key={action} className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-semibold text-gray-900">{action}</span>
                              </div>
                            )) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-4 border-t">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}