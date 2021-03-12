export const defaults = {
  tz: 'Asia/Tokyo',
  locale: 'ja_JP',
  menuPosition: 'br',
  darkTheme: false,
  chatSummaryExpand: true,
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
  messageThumbnailWidth: 128,
  messageThumbnailHeight: 128,
  messageThumbnailQuality: 30,
  messageSummaryLength: 100,
  messageSummaryLines: 4,
  messageSummaryThumbnailCount: 3,
  messageShortenTimestampThreshold: 20 * 3600 * 1000,
  uploadFileCountMax: 100
}
