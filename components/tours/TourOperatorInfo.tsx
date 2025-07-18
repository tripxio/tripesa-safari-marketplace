"use client";

import { useEffect, useState } from "react";
import { getAgency } from "@/lib/services/api";
import type { Agency } from "@/lib/types";

interface TourOperatorInfoProps {
  agencyId?: number;
}

export default function TourOperatorInfo({ agencyId }: TourOperatorInfoProps) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agencyId) return;

    const fetchAgency = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAgency(agencyId);
        setAgency(response.data);
      } catch (err) {
        setError("Failed to load agency info");
        console.error("Error fetching agency:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgency();
  }, [agencyId]);

  if (!agencyId) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        <span className="text-sm text-muted-foreground">Tour Operator</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-200 rounded" />
        <span className="text-sm text-muted-foreground">Tour Operator</span>
      </div>
    );
  }

  const logoUrl = agency.logo || "/placeholder.svg";

  return (
    <div className="flex items-center space-x-2">
      <img
        src={logoUrl}
        alt={agency.name}
        className="w-6 h-6 rounded object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/placeholder.svg";
        }}
      />
      <span className="text-sm text-muted-foreground">{agency.name}</span>
    </div>
  );
}
