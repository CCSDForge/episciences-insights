'use client';

import React from 'react';
import { Publication } from '@/lib/types';
import { Network } from 'lucide-react';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';

interface CollaborationWebProps {
  data: Publication[];
}

export default function CollaborationWeb({ data }: CollaborationWebProps) {
  return (
    <CoOccurrenceNetwork
      data={data}
      getEntities={(p) => {
        const seen = new Map<string, { id: string; name: string; meta: Record<string, string> }>();
        p.authors.forEach((a) => a.institutions.forEach((inst) => {
          const id = inst.ror || inst.name;
          if (id && !seen.has(id)) seen.set(id, { id, name: inst.name, meta: { Region: inst.country || '?' } });
        }));
        return Array.from(seen.values());
      }}
      icon={<Network size={24} />}
      title="Global Reach"
      subtitle="Institutional Synergy Map"
      entityLabelPlural="Institutions"
      metaLabel="Region"
      colorTheme="blue"
      tooltipId="collab-tooltip"
      emptyMessage="Collaborative data unavailable for this selection"
    />
  );
}
