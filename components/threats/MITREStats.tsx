"use client";

import { Shield, Target, Activity, TrendingUp } from "lucide-react";

interface MITREStatsProps {
  stats: {
    total_tactics: number;
    total_techniques: number;
    total_mappings: number;
    top_mapped_techniques: Array<{
      technique_id: string;
      name: string;
      count: number;
    }>;
  } | null;
  loading: boolean;
}

export default function MITREStats({ stats, loading }: MITREStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Tactics",
      value: stats.total_tactics.toString(),
      icon: Shield,
      color: "cyan",
      bgColor: "bg-cyan-500/10",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/20",
    },
    {
      label: "Total Techniques",
      value: stats.total_techniques.toString(),
      icon: Target,
      color: "purple",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Threat Mappings",
      value: stats.total_mappings.toString(),
      icon: Activity,
      color: "orange",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-400",
      borderColor: "border-orange-500/20",
    },
    {
      label: "Top Techniques",
      value: stats.top_mapped_techniques.length.toString(),
      icon: TrendingUp,
      color: "green",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-400",
      borderColor: "border-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border rounded-xl p-6 
                       transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.bgColor} rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.iconColor}`}>
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}