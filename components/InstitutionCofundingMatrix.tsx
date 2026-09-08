'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { Publication } from '@/lib/types';
import CoOccurrenceMatrix from './CoOccurrenceMatrix';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface InstitutionCofundingMatrixProps {
  data: Publication[];
}

export default function InstitutionCofundingMatrix({ data }: InstitutionCofundingMatrixProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceMatrix
      data={data}
      getEntities={(p) => {
        const seen = new Map<string, string>();
        p.authors.forEach((a) => a.institutions.forEach((inst) => {
          const id = inst.ror || inst.name;
          if (id && !seen.has(id)) seen.set(id, inst.name);
        }));
        return Array.from(seen, ([id, name]) => ({ id, name }));
      }}
      icon={<Building2 size={24} />}
      title={t.dashboard.institutionNetworkTitle}
      subtitle={t.matrix.subtitleDiagonal}
      entityLabelPlural={t.countryInstitutions.identifiedInstitutions.toLowerCase()}
      colorTheme="blue"
      tooltipId="institution-matrix-tooltip"
      noDataTitle={t.matrix.noDataTitle}
      noDataDescription={t.matrix.noDataDesc}
    />
  );
}
