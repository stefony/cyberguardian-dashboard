"use client";

import { useOrganization } from '@/app/contexts/OrganizationContext';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function OrganizationSelector() {
  const { currentOrganization, organizations, switchOrganization, loading } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || !currentOrganization) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
      >
        <Building2 className="w-4 h-4 text-purple-400" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-white">{currentOrganization.name}</span>
          <span className="text-xs text-gray-400">@{currentOrganization.slug}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && organizations.length > 1 && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-2">
            <div className="text-xs text-gray-400 px-3 py-2 font-semibold uppercase">
              Switch Organization
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  switchOrganization(org.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  org.id === currentOrganization.id
                    ? 'bg-purple-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{org.name}</span>
                  <span className="text-xs opacity-75">@{org.slug}</span>
                </div>
                {org.id === currentOrganization.id && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}