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
exports.BrowserManager = void 0;
const playwright_1 = require("playwright");
class BrowserManager {
    constructor(config) {
        this.config = config;
        this.browser = null;
        this.page = null;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log('🌐 Inicializando navegador...');
            // Configuración del navegador con stealth mejorado
            this.browser = yield playwright_1.chromium.launch({
                headless: (_a = this.config.headless) !== null && _a !== void 0 ? _a : true,
                slowMo: (_b = this.config.slowMo) !== null && _b !== void 0 ? _b : 0,
                args: this.getBrowserArgs()
            });
            this.page = yield this.browser.newPage();
            // Configurar User-Agent realista
            yield this.configureUserAgent();
            // Configurar permisos
            yield this.configurePermissions();
            // Script anti-detección
            yield this.setupStealth();
            console.log('✅ Navegador configurado correctamente');
            return { browser: this.browser, page: this.page };
        });
    }
    getBrowserArgs() {
        return [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--allow-running-insecure-content',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-dev-shm-usage',
            '--disable-field-trial-config',
            '--disable-ipc-flooding-protection',
            '--disable-extensions-except',
            '--disable-plugins-discovery',
            '--disable-default-apps',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-sync',
            '--disable-component-update',
            '--disable-client-side-phishing-detection'
        ];
    }
    configureUserAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                throw new Error('Page no inicializada');
            yield this.page.context().addInitScript(() => {
                Object.defineProperty(navigator, 'userAgent', {
                    get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                });
            });
        });
    }
    configurePermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                throw new Error('Page no inicializada');
            const context = this.page.context();
            yield context.grantPermissions(['microphone', 'camera'], {
                origin: 'https://meet.google.com'
            });
        });
    }
    setupStealth() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                throw new Error('Page no inicializada');
            yield this.page.addInitScript(() => {
                var _a, _b;
                // Ocultar que es un navegador automatizado
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                // Simular plugins realistas
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
                // Simular idiomas realistas
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
                // Ocultar propiedades de automatización
                (_b = (_a = window.chrome) === null || _a === void 0 ? void 0 : _a.runtime) === null || _b === void 0 ? true : delete _b.onConnect;
                // Simular comportamiento de usuario real
                const originalQuery = window.navigator.permissions.query;
                return originalQuery({ name: 'notifications' }).then((result) => {
                    const originalAddEventListener = result.addEventListener;
                    result.addEventListener = function (name, listener, options) {
                        if (name === 'change') {
                            setTimeout(() => listener({ target: { state: 'granted' } }), 100);
                        }
                        return originalAddEventListener.call(result, name, listener, options);
                    };
                    return result;
                });
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.page) {
                yield this.page.close();
                this.page = null;
            }
            if (this.browser) {
                yield this.browser.close();
                this.browser = null;
            }
        });
    }
}
exports.BrowserManager = BrowserManager;
