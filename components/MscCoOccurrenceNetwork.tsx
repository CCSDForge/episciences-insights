'use client';

import React from 'react';
import { Publication } from '@/lib/types';
import { Sigma } from 'lucide-react';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';
import { getMscClass } from '@/lib/mscClasses';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface MscCoOccurrenceNetworkProps {
  data: Publication[];
}

// Grouped by the 2-digit MSC 2020 class (e.g. "68" Computer science, "05"
// Combinatorics) rather than the full 5-character code — the raw codes are
// too sparse for a readable graph even on the maths sub-corpus this draws
// from (2339/7826 publications, 85.6% carrying 2+ codes).
export default function MscCoOccurrenceNetwork({ data }: MscCoOccurrenceNetworkProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceNetwork
      data={data}
      getEntities={(p) => {
        const classes = new Map<string, { id: string; name: string }>();
        (p.episciences?.msc_codes || []).forEach((code) => {
          const cls = getMscClass(code);
          if (!classes.has(cls.id)) classes.set(cls.id, cls);
        });
        return Array.from(classes.values());
      }}
      icon={<Sigma size={24} />}
      title={t.dashboard.mscNetworkTitle}
      subtitle={t.common.network}
      entityLabelPlural="MSC Classes"
      colorTheme="indigo"
      tooltipId="msc-network-tooltip"
      emptyMessage={t.matrix.noDataDesc}
    />
  );
}
