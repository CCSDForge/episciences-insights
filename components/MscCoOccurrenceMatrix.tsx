'use client';

import React from 'react';
import { Sigma } from 'lucide-react';
import { Publication } from '@/lib/types';
import CoOccurrenceMatrix from './CoOccurrenceMatrix';
import { getMscClass } from '@/lib/mscClasses';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface MscCoOccurrenceMatrixProps {
  data: Publication[];
}

// See MscCoOccurrenceNetwork.tsx — same 2-digit class grouping, same reason.
export default function MscCoOccurrenceMatrix({ data }: MscCoOccurrenceMatrixProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceMatrix
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
      title={t.dashboard.mscMatrixTitle}
      subtitle={t.matrix.subtitleDiagonal}
      entityLabelPlural="MSC classes"
      colorTheme="indigo"
      tooltipId="msc-matrix-tooltip"
      noDataTitle={t.matrix.noDataTitle}
      noDataDescription={t.matrix.noDataDesc}
    />
  );
}
