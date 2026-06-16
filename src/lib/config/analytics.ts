export const analyticsConfig = {
  googleAnalyticsConfigKey: 'google_analytics_id',
  enabledLocales: ['en'] as const,
}

export type AnalyticsEnabledLocale = (typeof analyticsConfig.enabledLocales)[number]
