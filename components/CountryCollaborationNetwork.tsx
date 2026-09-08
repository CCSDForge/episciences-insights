'use client';

import React from 'react';
import { Publication } from '@/lib/types';
import { Globe } from 'lucide-react';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';
import { getCountryName } from '@/lib/countryNames';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface CountryCollaborationNetworkProps {
  data: Publication[];
}

export default function CountryCollaborationNetwork({ data }: CountryCollaborationNetworkProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceNetwork
      data={data}
      getEntities={(p) => {
        const codes = new Set<string>();
        p.authors.forEach((a) => a.institutions.forEach((inst) => {
          if (inst.country) codes.add(inst.country.toUpperCase());
        }));
        return Array.from(codes).map((code) => ({ id: code, name: getCountryName(code) }));
      }}
      icon={<Globe size={24} />}
      title={t.dashboard.countryNetwork}
      subtitle={t.dashboard.countryNetworkTitle}
      entityLabelPlural={t.common.countries}
      colorTheme="blue"
      tooltipId="country-network-tooltip"
      emptyMessage={t.matrix.noDataDesc}
    />
  );
}
