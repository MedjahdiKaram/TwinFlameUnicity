export const analyticsConfig = {
  settingsStorageKey: 'twinflame_settings',
  analyticsIdField: 'analyticsId',
  enabledLocales: ['en'] as const,
}

export type AnalyticsEnabledLocale = (typeof analyticsConfig.enabledLocales)[number]
