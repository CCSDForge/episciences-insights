'use client';

import React from 'react';
import { Handshake } from 'lucide-react';
import { Publication } from '@/lib/types';
import CoOccurrenceMatrix from './CoOccurrenceMatrix';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface FunderCofundingMatrixProps {
  data: Publication[];
}

export default function FunderCofundingMatrix({ data }: FunderCofundingMatrixProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceMatrix
      data={data}
      getEntities={(p) => {
        const funders = Array.from(new Set(p.awards.map((a) => a.funder))).filter(Boolean);
        return funders.map((f) => ({ id: f, name: f }));
      }}
      icon={<Handshake size={24} />}
      title={t.dashboard.funderMatrixTitle}
      subtitle={t.matrix.subtitleDiagonal}
      entityLabelPlural={t.common.funders.toLowerCase()}
      colorTheme="teal"
      tooltipId="funder-matrix-tooltip"
      noDataTitle={t.matrix.noDataTitle}
      noDataDescription={t.matrix.noDataDesc}
    />
  );
}
