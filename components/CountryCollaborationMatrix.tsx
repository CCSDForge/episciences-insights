'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { Publication } from '@/lib/types';
import CoOccurrenceMatrix from './CoOccurrenceMatrix';
import { getCountryName } from '@/lib/countryNames';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface CountryCollaborationMatrixProps {
  data: Publication[];
}

export default function CountryCollaborationMatrix({ data }: CountryCollaborationMatrixProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceMatrix
      data={data}
      getEntities={(p) => {
        const codes = new Set<string>();
        p.authors.forEach((a) => a.institutions.forEach((inst) => {
          if (inst.country) codes.add(inst.country.toUpperCase());
        }));
        return Array.from(codes).map((code) => ({ id: code, name: getCountryName(code) }));
      }}
      icon={<Globe size={24} />}
      title={t.dashboard.collaborationMatrix}
      subtitle={t.matrix.subtitleDiagonal}
      entityLabelPlural={t.common.countries.toLowerCase()}
      colorTheme="blue"
      tooltipId="country-matrix-tooltip"
      noDataTitle={t.matrix.noDataTitle}
      noDataDescription={t.matrix.noDataDesc}
    />
  );
}
