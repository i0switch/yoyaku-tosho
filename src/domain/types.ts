export interface InputPost {
  text: string;
  mediaPaths?: string[];
  scheduledAt?: string; // ISO 8601 or custom string for manual override
}

export interface ScheduledPost extends InputPost {
  id: string;
  order: number;
  scheduledAt: string; // Guaranteed to be set after scheduling
}

export interface ScheduleConfig {
  startDate?: string; // YYYY-MM-DD format
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  intervalMinutes: number;
}

export interface AppConfig {
  inputPath: string;
  storageStatePath: string;
  screenshotsDir: string;
  logsDir: string;
  dryRun: boolean;
  maxPosts?: number;
  offset?: number;
  headless: boolean;
  startTime?: string; // HH:mm format for current day
  cdpEndpoint?: string; // e.g. http://localhost:9222
  schedule?: ScheduleConfig;
}

export interface RunResult {
  postId: string;
  status: 'success' | 'failure' | 'skipped';
  error?: string;
  screenshotPath?: string;
}

export interface RunSummary {
  total: number;
  success: number;
  failure: number;
  skipped: number;
  results: RunResult[];
}
