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
exports.GoogleMeetTranscription = void 0;
class GoogleMeetTranscription {
    constructor(page, options = {}) {
        this.transcriptionEntries = [];
        this.isRecording = false;
        this.pollingInterval = null;
        this.captionMonitorInterval = null;
        this.page = page;
        this.options = Object.assign({ enableAutomatic: true, enableLiveCaption: true, language: 'es-ES', interval: 2000 }, options);
    }
    /**
     * Inicia la captura de transcripciones
     */
    startTranscription() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🎤 [TRANSCRIPTION] Iniciando captura de transcripciones...');
            try {
                // Habilitar subtítulos automáticos si está disponible
                if (this.options.enableLiveCaption) {
                    yield this.enableLiveCaptions();
                }
                // Comenzar el monitoreo de transcripciones
                this.isRecording = true;
                yield this.startPolling();
                // Iniciar monitor persistente de subtítulos
                yield this.startCaptionMonitor();
                console.log('✅ [TRANSCRIPTION] Transcripción iniciada exitosamente');
            }
            catch (error) {
                console.error('❌ [TRANSCRIPTION] Error iniciando transcripción:', error);
                throw error;
            }
        });
    }
    /**
     * Detiene la captura de transcripciones
     */
    stopTranscription() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🛑 [TRANSCRIPTION] Deteniendo captura de transcripciones...');
            this.isRecording = false;
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
            if (this.captionMonitorInterval) {
                clearInterval(this.captionMonitorInterval);
                this.captionMonitorInterval = null;
            }
            console.log('✅ [TRANSCRIPTION] Transcripción detenida');
        });
    }
    /**
     * Habilita los subtítulos automáticos en Google Meet
     */
    enableLiveCaptions() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('📝 [TRANSCRIPTION] Habilitando subtítulos automáticos...');
            try {
                // Esperar a que la página se estabilice completamente
                yield this.page.waitForTimeout(3000);
                // Selectores para el botón de subtítulos más específicos
                const captionSelectors = [
                    '[aria-label*="Turn on captions"]',
                    '[aria-label*="Activar subtítulos"]',
                    /* 'span:has-text("Turn on captions")',
                    'span:has-text("Activar subtítulos")',
                    '[aria-label*="captions"]',
                    '[aria-label*="subtítulos"]',
                    'button[data-tooltip*="captions"]',
                    'button[data-tooltip*="subtítulos"]' */
                ];
                let captionButton = null;
                console.log('🔍 [TRANSCRIPTION] Buscando botón de subtítulos...');
                for (const selector of captionSelectors) {
                    try {
                        captionButton = yield this.page.waitForSelector(selector, { timeout: 3000 });
                        if (captionButton) {
                            console.log(`✅ [TRANSCRIPTION] Botón de subtítulos encontrado: ${selector}`);
                            break;
                        }
                    }
                    catch (e) {
                        continue;
                    }
                }
                if (captionButton) {
                    yield captionButton.click();
                    console.log('✅ [TRANSCRIPTION] Subtítulos automáticos habilitados');
                    // Esperar a que se activen los subtítulos
                    yield this.page.waitForTimeout(3000);
                    // Verificar si hay opciones de idioma
                    yield this.configureCaptionLanguage();
                }
                else {
                    console.log('⚠️ [TRANSCRIPTION] Botón de subtítulos no encontrado - intentando método alternativo');
                }
            }
            catch (error) {
                console.log(`⚠️ [TRANSCRIPTION] Error habilitando subtítulos: ${error}`);
                console.log('🔄 [TRANSCRIPTION] Continuando sin subtítulos automáticos...');
            }
        });
    }
    /**
     * Configura el idioma de los subtítulos
     */
    configureCaptionLanguage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🌐 [TRANSCRIPTION] Configurando idioma de subtítulos...');
                // Esperar un momento para que el menú se estabilice
                yield this.page.waitForTimeout(3000);
                // Buscar el combobox de idioma que aparece con los subtítulos
                const languageComboBoxSelectors = [
                    '[aria-label="Meeting language"]',
                    '[jsname="oYxtQd"][role="combobox"]',
                    'div[role="combobox"][aria-label*="language"]',
                    'div[role="combobox"][aria-label*="idioma"]',
                    '.rHGeGc-TkwUic[role="combobox"]',
                    'div[jsname="oYxtQd"]'
                ];
                console.log('🔍 [TRANSCRIPTION] Buscando combobox de idioma en el box de subtítulos...');
                for (const selector of languageComboBoxSelectors) {
                    try {
                        const languageButton = yield this.page.waitForSelector(selector, { timeout: 3000 });
                        if (languageButton) {
                            console.log(`✅ [TRANSCRIPTION] Combobox de idioma encontrado: ${selector}`);
                            // Hacer clic para abrir el menú de idiomas
                            yield languageButton.click();
                            yield this.page.waitForTimeout(1500);
                            console.log('🌐 [TRANSCRIPTION] Menú de idiomas abierto');
                            // Buscar opción de español
                            yield this.selectSpanishFromDropdown();
                            return;
                        }
                    }
                    catch (e) {
                        console.log(`⚠️ [TRANSCRIPTION] Selector "${selector}" no encontrado`);
                        continue;
                    }
                }
                console.log('⚠️ [TRANSCRIPTION] Combobox de idioma no encontrado');
            }
            catch (error) {
                console.log(`⚠️ [TRANSCRIPTION] Error configurando idioma: ${error}`);
            }
        });
    }
    /**
     * Inicia el polling para capturar transcripciones
     */
    startPolling() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`🔄 [TRANSCRIPTION] Iniciando polling cada ${this.options.interval}ms`);
            this.pollingInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (this.isRecording && !this.page.isClosed()) {
                    yield this.captureTranscriptions();
                }
            }), this.options.interval);
        });
    }
    /**
     * Inicia monitor persistente para mantener subtítulos activos
     */
    startCaptionMonitor() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('👁️ [TRANSCRIPTION] Iniciando monitor persistente de subtítulos...');
            this.captionMonitorInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (this.isRecording && !this.page.isClosed()) {
                    yield this.checkAndReactivateCaptions();
                }
            }), 10000); // Revisar cada 10 segundos
        });
    }
    /**
     * Verifica si los subtítulos están activos y los reactiva si es necesario
     */
    checkAndReactivateCaptions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 [TRANSCRIPTION] Verificando estado de subtítulos...');
                // Buscar indicadores de que los subtítulos están desactivados
                const captionsOff = yield this.page.$('[aria-label*="Turn on captions"], [aria-label*="Activar subtítulos"]');
                if (captionsOff) {
                    console.log('⚠️ [TRANSCRIPTION] Subtítulos desactivados - reactivando...');
                    yield this.enableLiveCaptions();
                    // Después de reactivar, configurar idioma nuevamente
                    yield this.page.waitForTimeout(3000);
                    yield this.configureCaptionLanguage();
                }
                else {
                    console.log('✅ [TRANSCRIPTION] Subtítulos siguen activos');
                    // Verificar si el idioma sigue siendo español
                    yield this.checkCurrentLanguage();
                }
            }
            catch (error) {
                console.log(`⚠️ [TRANSCRIPTION] Error en monitor de subtítulos: ${error}`);
            }
        });
    }
    /**
     * Verifica el idioma actual de los subtítulos
     */
    checkCurrentLanguage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Buscar el combobox de idioma para ver qué idioma está seleccionado
                const languageCombobox = yield this.page.$('[aria-label="Meeting language"]');
                if (languageCombobox) {
                    const currentLanguage = yield languageCombobox.textContent();
                    console.log(`🌐 [TRANSCRIPTION] Idioma actual: "${currentLanguage === null || currentLanguage === void 0 ? void 0 : currentLanguage.trim()}"`);
                    // Si no es español, intentar cambiarlo
                    if (currentLanguage && !currentLanguage.toLowerCase().includes('spanish') && !currentLanguage.toLowerCase().includes('español')) {
                        console.log('⚠️ [TRANSCRIPTION] Idioma no es español - corrigiendo...');
                        yield this.configureCaptionLanguage();
                    }
                    else {
                        console.log('✅ [TRANSCRIPTION] Idioma correcto (español)');
                    }
                }
            }
            catch (error) {
                console.log(`⚠️ [TRANSCRIPTION] Error verificando idioma actual: ${error}`);
            }
        });
    }
    /**
     * Selecciona español del dropdown de idiomas abierto
     */
    selectSpanishFromDropdown() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 [TRANSCRIPTION] Buscando opciones de español en el dropdown...');
                // Esperar a que el dropdown esté completamente cargado
                yield this.page.waitForTimeout(1000);
                // Selectores específicos para el dropdown de idiomas basados en tu HTML
                const spanishSelectors = [
                    // Basado en el HTML que proporcionaste - li elements con Spanish
                    'li[role="option"]:has-text("Spanish")',
                    'li[role="option"]:has-text("Español")',
                    'li[role="option"] span:has-text("Spanish")',
                    'li[role="option"] span:has-text("Español")',
                    // Variaciones de español
                    'li[role="option"]:has-text("Spanish (Spain)")',
                    'li[role="option"]:has-text("Spanish (Mexico)")',
                    'li[role="option"]:has-text("Spanish (United States)")',
                    'li[role="option"]:has-text("Español (España)")',
                    'li[role="option"]:has-text("Español (México)")',
                    'li[role="option"]:has-text("Español (Estados Unidos)")',
                    // Selectores más específicos basados en las clases del HTML
                    '.W7g1Rb-rymPhb-KkROqb[role="option"] span[jsname="K4r5Ff"]:has-text("Spanish")',
                    '.W7g1Rb-rymPhb-KkROqb[role="option"] span:has-text("Español")',
                    // Selectores más genéricos
                    '[role="option"]:has-text("Spanish")',
                    '[role="option"]:has-text("Español")',
                    'span[jsname="K4r5Ff"]:has-text("Spanish")',
                    'span[jsname="K4r5Ff"]:has-text("Español")',
                    // Por data attributes o valores
                    '[data-value*="es"]',
                    '[data-value*="spanish"]'
                ];
                // También listar todas las opciones disponibles para debug
                try {
                    const allOptions = yield this.page.$$eval('li[role="option"], [role="option"]', options => options.map(option => {
                        var _a;
                        return ({
                            text: (_a = option.textContent) === null || _a === void 0 ? void 0 : _a.trim(),
                            innerHTML: option.innerHTML.substring(0, 100)
                        });
                    }));
                    console.log(`🔍 [TRANSCRIPTION] Opciones disponibles en dropdown: ${allOptions.length}`);
                    allOptions.slice(0, 10).forEach((option, index) => {
                        console.log(`  ${index + 1}. "${option.text}"`);
                    });
                }
                catch (e) {
                    console.log('⚠️ [TRANSCRIPTION] No se pudieron listar las opciones del dropdown');
                }
                // Intentar seleccionar español
                for (const selector of spanishSelectors) {
                    try {
                        console.log(`🔍 [TRANSCRIPTION] Probando selector: "${selector}"`);
                        const element = yield this.page.waitForSelector(selector, { timeout: 2000 });
                        if (element) {
                            const text = yield element.textContent();
                            console.log(`✅ [TRANSCRIPTION] Opción de español encontrada: "${text === null || text === void 0 ? void 0 : text.trim()}"`);
                            yield element.click();
                            console.log('✅ [TRANSCRIPTION] Idioma español seleccionado exitosamente');
                            // Esperar a que se cierre el dropdown
                            yield this.page.waitForTimeout(1000);
                            return;
                        }
                    }
                    catch (e) {
                        console.log(`⚠️ [TRANSCRIPTION] Selector "${selector}" no funcionó`);
                        continue;
                    }
                }
                console.log('❌ [TRANSCRIPTION] No se pudo encontrar opción de español en el dropdown');
                // Como último recurso, intentar hacer clic en la primera opción que contenga "Spanish" o "Español"
                try {
                    const allOptions = yield this.page.$$('li[role="option"], [role="option"]');
                    for (const option of allOptions) {
                        const text = yield option.textContent();
                        if (text && (text.toLowerCase().includes('spanish') || text.toLowerCase().includes('español'))) {
                            console.log(`✅ [TRANSCRIPTION] Encontrada opción por texto: "${text.trim()}"`);
                            yield option.click();
                            console.log('✅ [TRANSCRIPTION] Opción seleccionada por búsqueda de texto');
                            return;
                        }
                    }
                }
                catch (e) {
                    console.log('❌ [TRANSCRIPTION] Búsqueda por texto también falló');
                }
            }
            catch (error) {
                console.log(`❌ [TRANSCRIPTION] Error seleccionando español del dropdown: ${error}`);
            }
        });
    }
    /**
     * Captura las transcripciones visibles en la pantalla
     */
    captureTranscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 [TRANSCRIPTION] Buscando transcripciones...');
                // Selectores para diferentes elementos de transcripción en Google Meet
                const transcriptionSelectors = [
                    // Selector principal basado en aria-label="Captions"
                    'div[aria-label="Captions"]',
                    'div[aria-label="Captions"] *',
                    '[aria-label="Captions"] div',
                    '[aria-label="Captions"] span',
                    '[aria-label="Captions"] p',
                    // Variaciones en español
                    'div[aria-label="Subtítulos"]',
                    'div[aria-label="Subtítulos"] *',
                    '[aria-label="Subtítulos"] div',
                    '[aria-label="Subtítulos"] span',
                ];
                let captionsFound = false;
                let totalElementsChecked = 0;
                for (const selector of transcriptionSelectors) {
                    try {
                        const captionElements = yield this.page.$$(selector);
                        totalElementsChecked += captionElements.length;
                        console.log(`🔍 [TRANSCRIPTION] Selector "${selector}": ${captionElements.length} elementos`);
                        for (const element of captionElements) {
                            const text = yield element.textContent();
                            if (text && text.trim().length > 0) {
                                console.log(`📝 [TRANSCRIPTION] Texto encontrado: "${text.trim()}"`);
                                // Verificar si es realmente una transcripción
                                if (this.isLikelyTranscription(text.trim())) {
                                    yield this.processCaptionText(text.trim());
                                    captionsFound = true;
                                    console.log(`✅ [TRANSCRIPTION] Transcripción procesada: "${text.trim()}"`);
                                }
                                else {
                                    console.log(`❌ [TRANSCRIPTION] Texto descartado (no es transcripción): "${text.trim()}"`);
                                }
                            }
                        }
                        if (captionsFound) {
                            break; // Si encontramos subtítulos, no necesitamos buscar más
                        }
                    }
                    catch (error) {
                        console.log(`⚠️ [TRANSCRIPTION] Error con selector "${selector}": ${error}`);
                        continue;
                    }
                }
                console.log(`📊 [TRANSCRIPTION] Total elementos verificados: ${totalElementsChecked}`);
            }
            catch (error) {
                console.log(`⚠️ [TRANSCRIPTION] Error capturando transcripciones: ${error}`);
            }
        });
    }
    /**
     * Determina si un texto es probablemente una transcripción
     */
    isLikelyTranscription(text) {
        // Criterios para identificar transcripciones
        const hasWords = text.split(' ').length >= 3;
        const hasLetters = /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(text);
        const notTooShort = text.length >= 15;
        const notTooLong = text.length <= 300;
        // Filtrar elementos de UI comunes que aparecen en los subtítulos
        const uiElements = [
            'button', 'click', 'menu', 'arrow_downward', 'Ir al final',
            'more_vert', 'settings', 'close', 'expand_more', 'expand_less',
            'play_arrow', 'pause', 'volume_up', 'volume_down', 'fullscreen',
            'fullscreen_exit', 'mic', 'mic_off', 'videocam', 'videocam_off',
            'screen_share', 'stop_screen_share', 'chat', 'people', 'apps',
            'more_horiz', 'keyboard_arrow_down', 'keyboard_arrow_up'
        ];
        const hasUIElements = uiElements.some(ui => text.toLowerCase().includes(ui.toLowerCase()));
        // Filtrar si contiene solo nombres de participantes sin texto hablado
        const onlyNames = /^[A-Za-záéíóúñÁÉÍÓÚÑ\s]+$/.test(text) && text.split(' ').length <= 3;
        // Filtrar patrones específicos de Google Meet UI
        const meetUIPatterns = [
            /arrow_downward/i,
            /Ir al final/i,
            /^\w+\s+\w+$/, // Solo dos palabras (probablemente nombre + apellido)
            /^\w+\s+\w+\.\s+\w+\s+\w+/, // Patrón "Nombre Apellido. Nombre Apellido"
        ];
        const hasUIPatterns = meetUIPatterns.some(pattern => pattern.test(text));
        const isValid = hasWords && hasLetters && notTooShort && notTooLong && !hasUIElements && !onlyNames && !hasUIPatterns;
        if (!isValid) {
            console.log(`❌ [TRANSCRIPTION] Texto descartado - razón: words=${hasWords}, letters=${hasLetters}, length=${notTooShort}-${notTooLong}, ui=${!hasUIElements}, names=${!onlyNames}, patterns=${!hasUIPatterns}`);
        }
        return isValid;
    }
    /**
     * Procesa y almacena el texto de subtítulos
     */
    processCaptionText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`📝 [TRANSCRIPTION] Procesando texto: "${text}"`);
            // Limpiar elementos de UI antes de procesar
            let cleanedText = this.cleanUIElements(text);
            if (!cleanedText || cleanedText.trim().length === 0) {
                console.log(`⚠️ [TRANSCRIPTION] Texto vacío después de limpiar UI, omitiendo`);
                return;
            }
            // Intentar detectar el hablante y extraer el texto hablado
            let speaker = 'Unknown Speaker';
            let finalText = cleanedText;
            // Patrón para detectar "Nombre: texto"
            const speakerMatch = cleanedText.match(/^([^:]+):\s*(.+)$/);
            if (speakerMatch) {
                speaker = speakerMatch[1].trim();
                finalText = speakerMatch[2].trim();
                console.log(`👤 [TRANSCRIPTION] Hablante detectado: "${speaker}"`);
            }
            else {
                // Intentar extraer hablante de patrones como "Nombre Apellido texto..."
                // Solo si es un nombre realista (máximo 3 palabras y cada una empezando con mayúscula)
                const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+(.+)$/;
                const nameMatch = cleanedText.match(namePattern);
                if (nameMatch && nameMatch[2].length > 20) { // Solo si hay suficiente texto después del nombre
                    const potentialName = nameMatch[1].trim();
                    const restOfText = nameMatch[2].trim();
                    // Verificar que el nombre no sea parte del texto hablado
                    if (!restOfText.toLowerCase().startsWith(potentialName.toLowerCase())) {
                        speaker = potentialName;
                        finalText = restOfText;
                        console.log(`👤 [TRANSCRIPTION] Hablante extraído del texto: "${speaker}"`);
                    }
                }
            }
            // Verificar duplicados basándose en el texto final limpio y una ventana de tiempo
            const recentEntries = this.transcriptionEntries.slice(-5); // Últimas 5 entradas
            const isDuplicate = recentEntries.some(entry => {
                const timeDiff = Date.now() - entry.timestamp.getTime();
                const isRecentEnough = timeDiff < 10000; // 10 segundos
                const isSimilarText = this.calculateSimilarity(entry.text, finalText) > 0.8;
                return isRecentEnough && isSimilarText;
            });
            if (isDuplicate) {
                console.log(`⚠️ [TRANSCRIPTION] Texto similar reciente encontrado, omitiendo: "${finalText}"`);
                return;
            }
            // Verificar si es una versión extendida de la última entrada (Google Meet muestra texto acumulativo)
            const lastEntry = this.transcriptionEntries[this.transcriptionEntries.length - 1];
            if (lastEntry) {
                const timeDiff = Date.now() - lastEntry.timestamp.getTime();
                if (timeDiff < 8000 && finalText.includes(lastEntry.text)) { // 8 segundos
                    // Es una extensión de la última transcripción, actualizar en lugar de crear nueva
                    console.log(`🔄 [TRANSCRIPTION] Actualizando transcripción anterior: "${lastEntry.text}" -> "${finalText}"`);
                    lastEntry.text = finalText;
                    lastEntry.timestamp = new Date();
                    console.log(`✅ [TRANSCRIPTION] ${lastEntry.timestamp.toISOString()}: [${lastEntry.speaker}] ${finalText}`);
                    return;
                }
            }
            const entry = {
                timestamp: new Date(),
                speaker,
                text: finalText,
                language: this.options.language
            };
            this.transcriptionEntries.push(entry);
            console.log(`✅ [TRANSCRIPTION] ${entry.timestamp.toISOString()}: [${speaker}] ${finalText}`);
            // Limitar el número de entradas en memoria para evitar uso excesivo
            if (this.transcriptionEntries.length > 1000) {
                this.transcriptionEntries = this.transcriptionEntries.slice(-500);
                console.log(`🗑️ [TRANSCRIPTION] Limitando entradas a 500 (total era ${this.transcriptionEntries.length + 500})`);
            }
        });
    }
    /**
     * Calcula la similitud entre dos textos
     */
    calculateSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }
    /**
     * Limpia elementos de UI del texto de transcripción
     */
    cleanUIElements(text) {
        let cleaned = text;
        // Remover iconos de Material Design
        const iconPatterns = [
            /arrow_downward/gi,
            /arrow_upward/gi,
            /more_vert/gi,
            /more_horiz/gi,
            /expand_more/gi,
            /expand_less/gi,
            /keyboard_arrow_\w+/gi,
            /play_arrow/gi,
            /pause/gi,
            /volume_\w+/gi,
            /fullscreen/gi,
            /mic/gi,
            /videocam/gi,
            /screen_share/gi,
            /chat/gi,
            /people/gi,
            /apps/gi,
            /settings/gi,
            /close/gi
        ];
        iconPatterns.forEach(pattern => {
            cleaned = cleaned.replace(pattern, '');
        });
        // Remover frases de UI comunes
        const uiPhrases = [
            /Ir al final/gi,
            /Go to end/gi,
            /Scroll to bottom/gi,
            /Turn on captions/gi,
            /Activar subtítulos/gi,
            /Turn off captions/gi,
            /Desactivar subtítulos/gi
        ];
        uiPhrases.forEach(pattern => {
            cleaned = cleaned.replace(pattern, '');
        });
        // Limpiar espacios múltiples y caracteres especiales
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        // Remover puntos al final que vienen de los nombres
        cleaned = cleaned.replace(/\.$/, '');
        return cleaned;
    }
    /**
     * Obtiene todas las transcripciones capturadas
     */
    getTranscriptions() {
        return [...this.transcriptionEntries];
    }
    /**
     * Obtiene las transcripciones desde un timestamp específico
     */
    getTranscriptionsSince(since) {
        return this.transcriptionEntries.filter(entry => entry.timestamp >= since);
    }
    /**
     * Obtiene un resumen de la transcripción
     */
    getTranscriptionSummary() {
        if (this.transcriptionEntries.length === 0) {
            return {
                totalEntries: 0,
                speakers: []
            };
        }
        const speakers = [...new Set(this.transcriptionEntries.map(entry => entry.speaker))];
        const startTime = this.transcriptionEntries[0].timestamp;
        const endTime = this.transcriptionEntries[this.transcriptionEntries.length - 1].timestamp;
        const duration = endTime.getTime() - startTime.getTime();
        return {
            totalEntries: this.transcriptionEntries.length,
            speakers,
            startTime,
            endTime,
            duration
        };
    }
    /**
     * Exporta las transcripciones a formato de texto
     */
    exportToText() {
        if (this.transcriptionEntries.length === 0) {
            return 'No hay transcripciones disponibles.';
        }
        let output = `TRANSCRIPCIÓN DE REUNIÓN\n`;
        output += `Generado el: ${new Date().toISOString()}\n`;
        output += `Total de entradas: ${this.transcriptionEntries.length}\n\n`;
        for (const entry of this.transcriptionEntries) {
            const timestamp = entry.timestamp.toLocaleTimeString();
            output += `[${timestamp}] ${entry.speaker}: ${entry.text}\n`;
        }
        return output;
    }
    /**
     * Limpia todas las transcripciones almacenadas
     */
    clearTranscriptions() {
        this.transcriptionEntries = [];
        console.log('🗑️ [TRANSCRIPTION] Transcripciones limpiadas');
    }
    /**
     * Verifica si la transcripción está activa
     */
    isTranscribing() {
        return this.isRecording;
    }
    /**
     * Obtiene las estadísticas de transcripción
     */
    getStats() {
        const totalEntries = this.transcriptionEntries.length;
        const uniqueSpeakers = new Set(this.transcriptionEntries.map(e => e.speaker)).size;
        const totalWords = this.transcriptionEntries.reduce((sum, entry) => {
            return sum + entry.text.split(' ').length;
        }, 0);
        const averageWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
        const lastEntry = this.transcriptionEntries[totalEntries - 1];
        return {
            isRecording: this.isRecording,
            totalEntries,
            uniqueSpeakers,
            averageWordsPerEntry,
            lastEntryTime: lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.timestamp
        };
    }
}
exports.GoogleMeetTranscription = GoogleMeetTranscription;
