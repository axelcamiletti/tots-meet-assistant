// Main bot classes
export { MeetingBot } from './meeting-bot';
export { GoogleMeetBot } from './platforms/google-meet-bot';

// Base classes
export { BaseBot } from './core/base-bot';

// Modules
export { TranscriptionModule } from './modules/transcription-module';
export { RecordingModule } from './modules/recording-module';
export { MonitoringModule } from './modules/monitoring-module';

// Core services
export { BrowserManager } from './core/browser-manager';
export { SessionManager } from './core/session-manager';

// Platform-specific modules
export { GoogleMeetTranscriptionModule } from './platforms/google-meet/transcription';
export { GoogleMeetMonitoringModule } from './platforms/google-meet/monitoring';
export { GoogleMeetJoinModule } from './platforms/google-meet/join';

// Types
export * from './types/bot.types';

// Default export
import { MeetingBot } from './meeting-bot';
export default MeetingBot;
