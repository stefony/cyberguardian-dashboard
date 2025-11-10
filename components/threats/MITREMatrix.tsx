"use client";

import { ChevronRight, ExternalLink } from "lucide-react";

interface Technique {
  id: number;
  technique_id: string;
  name: string;
  description: string;
  url: string;
  tactic_id: number;
  platforms: string[];
}

interface MatrixData {
  tactic_id: string;
  tactic_name: string;
  description: string;
  technique_count: number;
  techniques: Technique[];
}

interface MITREMatrixProps {
  matrixData: MatrixData[];
  loading: boolean;
  onTechniqueClick: (technique: Technique) => void;
}

export default function MITREMatrix({
  matrixData,
  loading,
  onTechniqueClick,
}: MITREMatrixProps) {
  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700/50 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-700/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (matrixData.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">No Matrix Data</h3>
        <p className="text-gray-400">
          MITRE ATT&CK matrix data is not available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">ATT&CK Matrix</h2>
        <span className="text-sm text-gray-400">
          {matrixData.length} Tactics • {matrixData.reduce((acc, t) => acc + t.technique_count, 0)} Techniques
        </span>
      </div>

      {/* Horizontal Scrollable Matrix */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
           <div className="inline-flex gap-4 p-6">
            {matrixData.map((tactic) => (
              <div
                key={tactic.tactic_id}
                className="flex-shrink-0 w-80"
              >
                {/* Tactic Header */}
                <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
                              border border-cyan-500/30 rounded-t-xl p-4 mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono text-cyan-400">
                      {tactic.tactic_id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {tactic.technique_count} techniques
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {tactic.tactic_name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {tactic.description}
                  </p>
                </div>

                {/* Techniques List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 
                              scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {tactic.techniques.map((technique) => (
                    <button
                      key={technique.id}
                      onClick={() => onTechniqueClick(technique)}
                      className="w-full bg-gray-900/50 hover:bg-gray-700/50 border border-gray-700 
                               hover:border-cyan-500/50 rounded-lg p-3 transition-all duration-200 
                               text-left group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-mono text-purple-400">
                          {technique.technique_id}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 
                                                 transition-colors" />
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1 line-clamp-2 
                                   group-hover:text-cyan-400 transition-colors">
                        {technique.name}
                      </h4>
                      {technique.platforms && technique.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {technique.platforms.slice(0, 3).map((platform, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 
                                       rounded border border-gray-700"
                            >
                              {platform}
                            </span>
                          ))}
                          {technique.platforms.length > 3 && (
                            <span className="text-xs px-2 py-0.5 text-gray-500">
                              +{technique.platforms.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span className="text-gray-400">Tactic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-400">Technique ID</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Click for details</span>
          </div>
        </div>
      </div>
    </div>
  );
}