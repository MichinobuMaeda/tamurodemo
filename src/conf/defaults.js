export const defaults = {
  chatSummaryExpand: true,
  darkTheme: false,
  locale: 'ja_JP',
  menuPosition: 'br',
  tz: 'Asia/Tokyo',
  waitProcTimeout: 10 * 1000,
  routeExcludeFromStorage: [
    'invitation',
    'signin',
    'policy',
    'preferences'
  ],
  chatSummaryPaneHeight: '240px',
  chatPaneHeight: '360px',
  hidePrivilegedItems: false,
  messageSummaryLength: 100,
  messageSummaryLines: 4,
  messageShortenTimestampThreshold: 20 * 3600 * 1000
}
