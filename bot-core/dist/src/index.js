"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMeetJoinModule = exports.GoogleMeetMonitoringModule = exports.GoogleMeetTranscriptionModule = exports.SessionManager = exports.BrowserManager = exports.MonitoringModule = exports.RecordingModule = exports.TranscriptionModule = exports.BaseBot = exports.GoogleMeetBot = exports.MeetingBot = void 0;
// Main bot classes
var meeting_bot_1 = require("./meeting-bot");
Object.defineProperty(exports, "MeetingBot", { enumerable: true, get: function () { return meeting_bot_1.MeetingBot; } });
var google_meet_bot_1 = require("./platforms/google-meet-bot");
Object.defineProperty(exports, "GoogleMeetBot", { enumerable: true, get: function () { return google_meet_bot_1.GoogleMeetBot; } });
// Base classes
var base_bot_1 = require("./core/base-bot");
Object.defineProperty(exports, "BaseBot", { enumerable: true, get: function () { return base_bot_1.BaseBot; } });
// Modules
var transcription_module_1 = require("./modules/transcription-module");
Object.defineProperty(exports, "TranscriptionModule", { enumerable: true, get: function () { return transcription_module_1.TranscriptionModule; } });
var recording_module_1 = require("./modules/recording-module");
Object.defineProperty(exports, "RecordingModule", { enumerable: true, get: function () { return recording_module_1.RecordingModule; } });
var monitoring_module_1 = require("./modules/monitoring-module");
Object.defineProperty(exports, "MonitoringModule", { enumerable: true, get: function () { return monitoring_module_1.MonitoringModule; } });
// Core services
var browser_manager_1 = require("./core/browser-manager");
Object.defineProperty(exports, "BrowserManager", { enumerable: true, get: function () { return browser_manager_1.BrowserManager; } });
var session_manager_1 = require("./core/session-manager");
Object.defineProperty(exports, "SessionManager", { enumerable: true, get: function () { return session_manager_1.SessionManager; } });
// Platform-specific modules
var transcription_1 = require("./platforms/google-meet/transcription");
Object.defineProperty(exports, "GoogleMeetTranscriptionModule", { enumerable: true, get: function () { return transcription_1.GoogleMeetTranscriptionModule; } });
var monitoring_1 = require("./platforms/google-meet/monitoring");
Object.defineProperty(exports, "GoogleMeetMonitoringModule", { enumerable: true, get: function () { return monitoring_1.GoogleMeetMonitoringModule; } });
var join_1 = require("./platforms/google-meet/join");
Object.defineProperty(exports, "GoogleMeetJoinModule", { enumerable: true, get: function () { return join_1.GoogleMeetJoinModule; } });
// Types
__exportStar(require("./types/bot.types"), exports);
// Default export
const meeting_bot_2 = require("./meeting-bot");
exports.default = meeting_bot_2.MeetingBot;
