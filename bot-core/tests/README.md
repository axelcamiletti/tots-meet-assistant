# TOTS Meet Assistant Bot - Tests

## Test Único Unificado

Este proyecto ahora usa **un solo test** que incluye todas las funcionalidades necesarias.

### Comandos de Test

```bash
# Test rápido (sin conexión real a meeting)
npm run test:quick

# Test completo (se conecta a meeting real)
npm run test
```

### Configuración

1. Crear archivo `.env` en la raíz del proyecto:
```bash
MEET_URL=https://meet.google.com/tu-meeting-code
```

2. El test completo se conectará a la URL configurada
3. El test rápido verifica la API sin conectarse

### ¿Qué incluye el test?

✅ **Test Rápido:**
- Verificación de API sin conexión
- Validación de métodos de transcripción
- Comprobación de exportación de datos

✅ **Test Completo:**
- Todo lo del test rápido +
- Conexión real a Google Meet
- Verificación de unión exitosa
- Monitoreo de participantes
- Captura de transcripciones en tiempo real
- Keep-alive automático (60 segundos)

### Archivos

- `tests/test.ts` - **ÚNICO TEST NECESARIO**
- `tests/README.md` - Esta documentación

### Uso en Desarrollo

```bash
# Durante desarrollo, usar test rápido
npm run test:quick

# Para probar conexión real antes de producción
npm run test
```

### Resultados

- ✅ **EXITOSO**: El bot funciona correctamente
- ❌ **FALLIDO**: Revisar errores antes de usar en producción

El test principal incluye toda la funcionalidad que antes estaba dispersa en múltiples archivos de test.
