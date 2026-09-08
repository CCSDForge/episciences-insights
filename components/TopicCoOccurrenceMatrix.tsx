'use client';

import React from 'react';
import { Tags } from 'lucide-react';
import { Publication } from '@/lib/types';
import CoOccurrenceMatrix from './CoOccurrenceMatrix';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface TopicCoOccurrenceMatrixProps {
  data: Publication[];
}

// 1834 distinct topic names corpus-wide, none dominant (the most frequent
// covers 12.4% of publications) — no trivial-node exclusion needed, the
// TopN cap below does all the filtering work.
export default function TopicCoOccurrenceMatrix({ data }: TopicCoOccurrenceMatrixProps) {
  const { t } = useTranslation();
  return (
    <CoOccurrenceMatrix
      data={data}
      getEntities={(p) => (p.topics || []).map((t) => ({ id: t.id, name: t.name }))}
      icon={<Tags size={24} />}
      title={t.dashboard.topicsMatrixTitle}
      subtitle={t.matrix.subtitleDiagonal}
      entityLabelPlural={t.tabs.topics.toLowerCase()}
      colorTheme="indigo"
      tooltipId="topic-matrix-tooltip"
      noDataTitle={t.matrix.noDataTitle}
      noDataDescription={t.matrix.noDataDesc}
    />
  );
}
