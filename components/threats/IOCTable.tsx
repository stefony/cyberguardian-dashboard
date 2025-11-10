"use client";

import { useState } from "react";
import { 
  Globe, 
  Hash, 
  Mail, 
  Link as LinkIcon,
  ExternalLink,
  Info,
  Copy,
  Check
} from "lucide-react";

interface IOC {
  id: number;
  ioc_type: string;
  ioc_value: string;
  threat_type: string | null;
  threat_name: string | null;
  severity: string;
  confidence: number;
  source: string;
  first_seen: string;
  last_seen: string;
  times_seen: number;
  description?: string;
}

interface IOCTableProps {
  iocs: IOC[];
  loading: boolean;
}

export default function IOCTable({ iocs, loading }: IOCTableProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedIOC, setSelectedIOC] = useState<IOC | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "ip":
        return <Globe className="w-4 h-4" />;
      case "domain":
        return <Globe className="w-4 h-4" />;
      case "hash":
        return <Hash className="w-4 h-4" />;
      case "url":
        return <LinkIcon className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const copyToClipboard = (value: string, id: number) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (iocs.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No IOCs Found</h3>
        <p className="text-gray-400">
          No indicators match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Indicator Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Threat
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                First Seen
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-700">
            {iocs.map((ioc) => (
              <tr
                key={ioc.id}
                className="hover:bg-gray-700/30 transition-colors duration-150 cursor-pointer"
                onClick={() => setSelectedIOC(ioc)}
              >
                {/* Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                      {getTypeIcon(ioc.ioc_type)}
                    </div>
                    <span className="text-sm font-medium text-white capitalize">
                      {ioc.ioc_type}
                    </span>
                  </div>
                </td>

                {/* IOC Value */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 max-w-xs">
                    <span className="text-sm text-gray-300 font-mono truncate">
                      {ioc.ioc_value}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(ioc.ioc_value, ioc.id);
                      }}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      {copiedId === ioc.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Threat Info */}
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {ioc.threat_name || "Unknown"}
                    </div>
                    {ioc.threat_type && (
                      <div className="text-xs text-gray-400 capitalize">
                        {ioc.threat_type}
                      </div>
                    )}
                  </div>
                </td>

                {/* Severity */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs 
                              font-medium border capitalize ${getSeverityColor(ioc.severity)}`}
                  >
                    {ioc.severity}
                  </span>
                </td>

                {/* Confidence */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-full max-w-[80px] bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ioc.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-300 font-medium">
                      {ioc.confidence}%
                    </span>
                  </div>
                </td>

                {/* Source */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300">{ioc.source}</span>
                </td>

                {/* First Seen */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">
                    {formatDate(ioc.first_seen)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIOC(ioc);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedIOC && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIOC(null)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full 
                       max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">IOC Details</h3>
                <p className="text-gray-400 text-sm">
                  ID: {selectedIOC.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedIOC(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">IOC Value</label>
                <div className="bg-gray-900/50 rounded-lg p-3 font-mono text-white break-all">
                  {selectedIOC.ioc_value}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Type</label>
                  <div className="text-white capitalize">{selectedIOC.ioc_type}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Severity</label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs 
                              font-medium border capitalize ${getSeverityColor(selectedIOC.severity)}`}
                  >
                    {selectedIOC.severity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Confidence</label>
                  <div className="text-white">{selectedIOC.confidence}%</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Source</label>
                  <div className="text-white">{selectedIOC.source}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">First Seen</label>
                  <div className="text-white">{formatDate(selectedIOC.first_seen)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Last Seen</label>
                  <div className="text-white">{formatDate(selectedIOC.last_seen)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Times Seen</label>
                <div className="text-white">{selectedIOC.times_seen}</div>
              </div>

              {selectedIOC.description && (
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Description</label>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-white">
                    {selectedIOC.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}