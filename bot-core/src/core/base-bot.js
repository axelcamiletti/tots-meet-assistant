"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBot = void 0;
const browser_manager_1 = require("./browser-manager");
const session_manager_1 = require("./session-manager");
const events_1 = require("events");
class BaseBot extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.browser = null;
        this.page = null;
        this.browserManager = new browser_manager_1.BrowserManager(config);
        this.sessionManager = new session_manager_1.SessionManager();
        console.log(`🤖 ${this.config.botName} inicializando...`);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🚀 Iniciando navegador...');
                // Inicializar navegador
                const { browser, page } = yield this.browserManager.initialize();
                this.browser = browser;
                this.page = page;
                // Crear sesión
                const session = this.sessionManager.createSession(this.config.meetingUrl);
                this.emit('sessionCreated', session);
                // Unirse a la reunión según la plataforma
                yield this.joinMeeting();
                this.emit('started');
                console.log('✅ Bot iniciado correctamente');
            }
            catch (error) {
                console.error('❌ Error iniciando el bot:', error);
                yield this.cleanup();
                this.emit('error', error);
                throw error;
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.endSession();
        });
    }
    endSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const session = this.sessionManager.getCurrentSession();
            if (session) {
                this.sessionManager.endSession();
                console.log(`📋 Sesión finalizada: ${session.id}`);
                this.emit('sessionEnded', session);
            }
            yield this.cleanup();
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🧹 Limpiando recursos...');
            try {
                if (this.page) {
                    yield this.page.close();
                    this.page = null;
                }
                if (this.browser) {
                    yield this.browser.close();
                    this.browser = null;
                }
                console.log('✅ Recursos liberados');
                this.emit('cleanup');
            }
            catch (error) {
                console.error('Error en cleanup:', error);
            }
        });
    }
    getSession() {
        return this.sessionManager.getCurrentSession();
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const session = this.sessionManager.getCurrentSession();
            return {
                status: (session === null || session === void 0 ? void 0 : session.status) || 'not_started',
                session
            };
        });
    }
}
exports.BaseBot = BaseBot;
