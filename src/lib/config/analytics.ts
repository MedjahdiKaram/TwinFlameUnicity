export const analyticsConfig = {
  googleAnalyticsConfigKey: 'google_analytics_id',
  defaultGoogleAnalyticsId: 'G-XR2XG1HCYY',
  enabledLocales: ['en', 'ar'] as const,
}

export type AnalyticsEnabledLocale = (typeof analyticsConfig.enabledLocales)[number]
