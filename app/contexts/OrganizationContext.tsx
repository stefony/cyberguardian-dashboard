"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  switchOrganization: (orgId: string) => void;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/organizations/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.organizations) {
          setOrganizations(data.organizations);
          
          // Set current organization from localStorage or use first one
          const savedOrgId = localStorage.getItem('current_organization_id');
          const currentOrg = savedOrgId 
            ? data.organizations.find((org: Organization) => org.id === savedOrgId)
            : data.organizations[0];
          
          if (currentOrg) {
            setCurrentOrganization(currentOrg);
            localStorage.setItem('current_organization_id', currentOrg.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('current_organization_id', org.id);
      // Reload page to refresh data with new organization context
      window.location.reload();
    }
  };

  return (
    <OrganizationContext.Provider value={{ 
      currentOrganization, 
      organizations, 
      switchOrganization,
      loading 
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}