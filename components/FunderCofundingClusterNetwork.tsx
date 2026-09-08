'use client';

import React from 'react';
import { Publication } from '@/lib/types';
import { Handshake } from 'lucide-react';
import CoOccurrenceForceNetwork from './CoOccurrenceForceNetwork';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface FunderCofundingClusterNetworkProps {
  data: Publication[];
}

export default function FunderCofundingClusterNetwork({ data }: FunderCofundingClusterNetworkProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceForceNetwork
      data={data}
      getEntities={(p) => {
        const funders = Array.from(new Set(p.awards.map((a) => a.funder))).filter(Boolean);
        return funders.map((f) => ({ id: f, name: f }));
      }}
      icon={<Handshake size={24} />}
      title={t.dashboard.funderClusterTitle}
      subtitle={t.common.cluster}
      entityLabelPlural={t.common.funders}
      colorTheme="teal"
      tooltipId="funder-cluster-tooltip"
      emptyMessage={t.matrix.noDataDesc}
    />
  );
}
