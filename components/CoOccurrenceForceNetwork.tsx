'use client';

import dynamic from 'next/dynamic';

// Additional "Cluster" view alongside CoOccurrenceMatrix/CoOccurrenceNetwork
// — same generic getEntities-driven data prep, but laid out with d3-force
// and colored by Louvain community instead of the fixed circular layout.
//
// The force-directed layout seeds node positions via an internal cos/sin
// spiral, then iterates a chaotic repulsion/attraction system for ~300
// ticks — small engine-level float differences between server and client
// (allowed by spec for transcendental functions) can compound over that
// many iterations into a real hydration mismatch, not just an ULP one.
// Client-only rendering sidesteps it entirely: the layout is only ever
// computed once, in the browser.
const CoOccurrenceForceNetwork = dynamic(() => import('./CoOccurrenceForceNetworkImpl'), {
  ssr: false,
  loading: () => <div className="w-full min-h-[500px] rounded-3xl bg-zinc-50/30 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 animate-pulse" />,
});

export default CoOccurrenceForceNetwork;
