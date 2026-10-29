/** Stands in for Mixpanel. It only logs to the console. */
const track = (eventName: string, properties: Record<string, unknown>) => {
  console.log(`[analytics] ${eventName}`, properties);
};

export const trackHistoryFilterSet = (properties: { matches: number }) => track('History Filter Set', properties);
