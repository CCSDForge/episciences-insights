'use client';

import React from 'react';
import { Publication } from '@/lib/types';
import { Tags } from 'lucide-react';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface TopicCoOccurrenceNetworkProps {
  data: Publication[];
}

export default function TopicCoOccurrenceNetwork({ data }: TopicCoOccurrenceNetworkProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceNetwork
      data={data}
      getEntities={(p) => (p.topics || []).map((t) => ({ id: t.id, name: t.name }))}
      icon={<Tags size={24} />}
      title={t.dashboard.topicsNetworkTitle}
      subtitle={t.common.network}
      entityLabelPlural={t.tabs.topics}
      colorTheme="indigo"
      tooltipId="topic-network-tooltip"
      emptyMessage={t.matrix.noDataDesc}
    />
  );
}
