'use client';

import React from 'react';
import { Publication } from '@/lib/types';
import { Handshake } from 'lucide-react';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface FunderCofundingNetworkProps {
  data: Publication[];
}

export default function FunderCofundingNetwork({ data }: FunderCofundingNetworkProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceNetwork
      data={data}
      getEntities={(p) => {
        const funders = Array.from(new Set(p.awards.map((a) => a.funder))).filter(Boolean);
        return funders.map((f) => ({ id: f, name: f }));
      }}
      icon={<Handshake size={24} />}
      title={t.dashboard.funderNetworkTitle}
      subtitle={t.common.network}
      entityLabelPlural={t.common.funders}
      colorTheme="teal"
      tooltipId="funder-network-tooltip"
      emptyMessage={t.matrix.noDataDesc}
    />
  );
}
