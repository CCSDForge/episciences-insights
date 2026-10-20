'use client';

import React from 'react';
import { Publication } from '@/lib/types';
import { Network } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';

interface CollaborationWebProps {
  data: Publication[];
}

export default function CollaborationWeb({ data }: CollaborationWebProps) {
  const { locale } = useTranslation();

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
      title={locale === 'fr' ? 'Rayonnement mondial' : locale === 'es' ? 'Alcance global' : 'Global Reach'}
      subtitle={locale === 'fr' ? 'Carte des synergies institutionnelles' : locale === 'es' ? 'Mapa de sinergias institucionales' : 'Institutional Synergy Map'}
      entityLabelPlural={locale === 'fr' ? 'Institutions' : locale === 'es' ? 'Instituciones' : 'Institutions'}
      metaLabel={locale === 'fr' ? 'Région' : locale === 'es' ? 'Región' : 'Region'}
      colorTheme="blue"
      tooltipId="collab-tooltip"
      emptyMessage={
        locale === 'fr'
          ? 'Données de collaboration indisponibles pour cette sélection'
          : locale === 'es'
          ? 'Datos de colaboración no disponibles para esta selección'
          : 'Collaborative data unavailable for this selection'
      }
    />
  );
}
