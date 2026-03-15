/**
 * Centralized selectors for X UI.
 * Prefer data-testid when possible.
 */
export const X_SELECTORS = {
  // Post button in the sidebar or mobile
  postButton: '[data-testid="SideNav_NewTweet_Button"]',
  
  // Post text area
  postTextInput: '[data-testid="tweetTextarea_0"]',
  
  // Media upload input
  mediaInput: 'input[data-testid="fileInput"]',
  
  // Schedule button in the compose dialog (using both testid and icon-based discovery)
  scheduleButton: '[data-testid="scheduleOption"], [aria-label*="Schedule"], [aria-label*="予約投稿"], [aria-label*="予約設定"]',
  
  // Schedule dialog selectors (using data-testid which is more stable)
  scheduleMonthSelect: 'select[data-testid="Month_Select"]',
  scheduleDaySelect: 'select[data-testid="Day_Select"]',
  scheduleYearSelect: 'select[data-testid="Year_Select"]',
  scheduleHourSelect: 'select[data-testid="Hour_Select"]',
  scheduleMinuteSelect: 'select[data-testid="Minute_Select"]',
  
  // Generic select fallback by index if testid fails
  scheduleSelects: 'select',
  
  // Confirm/Save schedule button in dialog
  scheduleConfirmButton: '[data-testid="ScheduledTweet_Buttons_Confirm"]',
  
  // Final post save button (it changes from "Post" to "Schedule")
  submitPostButton: '[data-testid="tweetButtonInline"], [data-testid="tweetButton"]',

  // Dialog check - target the top-most one or the one with specific IDs
  modalDialog: 'div[role="dialog"]',
  scheduleDialogTitle: '[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] [aria-level]',
  
  // Specific labels for discovery (Japanese UI)
  labelMonth: '月',
  labelDay: '日',
  labelYear: '年',
  labelHour: '時',
  labelMinute: '分',
  buttonConfirm: '確認する',
  buttonSchedule: '予約設定',
  
  // Cookie / Consent / Layer Masks
  cookieMask: '[data-testid="twc-cc-mask"]',
  genericMask: '[data-testid="mask"]',
  layersContainer: '#layers',
};
