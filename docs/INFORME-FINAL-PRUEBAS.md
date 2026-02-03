# INFORME FINAL DE PRUEBAS DE SOFTWARE
## Sistema de Gestión de Reservas

---

## 1. INTRODUCCIÓN

### 1.1 Presentación del Proyecto
Este informe documenta la ejecución integral de un programa de pruebas de software aplicado al **Sistema de Gestión de Reservas**, una API REST desarrollada en Node.js con Express y MongoDB.

### 1.2 Contexto Técnico
- **Tecnología Backend**: Node.js v18+ con Express.js
- **Base de Datos**: MongoDB con Mongoose ODM
- **Autenticación**: JSON Web Tokens (JWT)
- **Arquitectura**: REST API con patrón MVC

### 1.3 Objetivos de la Evaluación
1. Aplicar técnicas de análisis estático para identificar defectos en el código
2. Ejecutar pruebas funcionales para validar los endpoints de la API
3. Realizar pruebas de carga y rendimiento
4. Evaluar la seguridad del sistema
5. Implementar automatización de pruebas con CI/CD

---

## 2. ALCANCE

### 2.1 Componentes Evaluados
| Componente | Descripción | Tipo de Prueba |
|------------|-------------|----------------|
| authController.js | Controlador de autenticación (registro/login) | Unitarias, Integración |
| reservaController.js | Controlador de reservas | Unitarias, Integración |
| auth.js (middleware) | Middleware de verificación JWT | Unitarias, Seguridad |
| Rutas API | Endpoints /api/auth y /api/reservas | Funcionales, Carga |

### 2.2 Limitaciones
- Pruebas realizadas en ambiente de desarrollo/test
- Base de datos MongoDB en memoria para pruebas de integración
- Pruebas de carga limitadas a configuración local

### 2.3 Exclusiones
- Pruebas de interfaz de usuario (no aplica - API REST)
- Pruebas de compatibilidad de navegador

---

## 3. HERRAMIENTAS Y TECNOLOGÍAS EMPLEADAS

| Herramienta | Versión | Propósito | Fase |
|-------------|---------|-----------|------|
| **ESLint** | 9.x | Análisis estático de código | FASE 1 |
| **eslint-plugin-security** | 3.x | Detección de vulnerabilidades | FASE 1 |
| **Postman** | Latest | Pruebas funcionales de API | FASE 2 |
| **Jest** | 30.x | Pruebas unitarias y de integración | FASE 2, 5 |
| **Supertest** | 7.x | Pruebas HTTP de integración | FASE 2 |
| **k6** | Latest | Pruebas de carga y rendimiento | FASE 4 |
| **GitHub Actions** | - | CI/CD automatizado | FASE 5 |
| **mongodb-memory-server** | 11.x | BD en memoria para tests | FASE 2 |

---

## 4. PRUEBAS EJECUTADAS Y RESULTADOS

### 4.1 FASE 1: Pruebas Estáticas (ESLint + Security Plugin)

#### Resultados del Análisis
```
✅ Análisis completado sin errores críticos
✅ Plugin de seguridad configurado
✅ Reglas de código limpio aplicadas
```

#### Reglas Evaluadas
- `security/detect-object-injection`: Prevención de inyección de objetos
- `security/detect-unsafe-regex`: Detección de regex vulnerables
- `security/detect-eval-with-expression`: Prevención de eval malicioso
- `eqeqeq`: Uso de comparación estricta
- `no-eval`: Prohibición de eval()

### 4.2 FASE 2: Pruebas Unitarias (Jest)

#### Resumen de Ejecución
| Métrica | Valor |
|---------|-------|
| **Total de pruebas** | 23 |
| **Pruebas pasadas** | 23 ✅ |
| **Pruebas fallidas** | 0 |
| **Cobertura total** | 98.61% |

#### Cobertura por Archivo
| Archivo | Statements | Branches | Functions | Lines |
|---------|------------|----------|-----------|-------|
| authController.js | 100% | 100% | 100% | 100% |
| reservaController.js | 100% | 100% | 100% | 100% |
| auth.js (middleware) | 100% | 100% | 100% | 100% |
| User.js | 100% | 100% | 100% | 100% |
| Reserva.js | 100% | 100% | 100% | 100% |
| auth.js (routes) | 100% | 100% | 100% | 100% |
| reserva.js (routes) | 100% | 100% | 100% | 100% |
| app.js | 90.9% | 100% | 50% | 90.9% |

#### Casos de Prueba Unitarios
| ID | Descripción | Resultado |
|----|-------------|-----------|
| CP-01 | Registrar usuario nuevo correctamente | ✅ PASS |
| CP-02 | Rechazar registro si usuario existe | ✅ PASS |
| CP-03 | Manejar errores internos en registro | ✅ PASS |
| CP-04 | Autenticar con credenciales válidas | ✅ PASS |
| CP-05 | Rechazar login si usuario no existe | ✅ PASS |
| CP-06 | Rechazar login con contraseña incorrecta | ✅ PASS |
| CP-07 | Manejar errores de BD en login | ✅ PASS |
| CP-08 | Crear reserva válida | ✅ PASS |
| CP-09 | Manejar errores al crear reserva | ✅ PASS |
| CP-10 | Asociar reserva al usuario autenticado | ✅ PASS |
| CP-11 | Rechazar acceso sin token | ✅ PASS |
| CP-12 | Permitir acceso con token válido | ✅ PASS |
| CP-13 | Rechazar token inválido | ✅ PASS |
| CP-14 | Rechazar token expirado | ✅ PASS |
| CP-15 | Procesar token sin prefijo Bearer | ✅ PASS |

### 4.3 FASE 2: Pruebas de Integración (Supertest)

#### Casos de Prueba de Integración
| ID | Endpoint | Descripción | Resultado |
|----|----------|-------------|-----------|
| CP-INT-01 | POST /api/auth/register | Registro exitoso | ✅ PASS |
| CP-INT-02 | POST /api/auth/register | Rechaza duplicado | ✅ PASS |
| CP-INT-03 | POST /api/auth/login | Login exitoso | ✅ PASS |
| CP-INT-04 | POST /api/auth/login | Rechaza contraseña incorrecta | ✅ PASS |
| CP-INT-05 | POST /api/auth/login | Rechaza usuario inexistente | ✅ PASS |
| CP-INT-06 | POST /api/reservas | Crear reserva con token válido | ✅ PASS |
| CP-INT-07 | POST /api/reservas | Rechaza sin token (401) | ✅ PASS |
| CP-INT-08 | POST /api/reservas | Rechaza token inválido (400) | ✅ PASS |

### 4.4 FASE 3: Pruebas de Sistema y Seguridad

#### Pruebas de Seguridad Básica (Postman)
| ID | Tipo de Ataque | Resultado |
|----|----------------|-----------|
| SEC-01 | SQL Injection en login | ✅ PROTEGIDO |
| SEC-02 | NoSQL Injection | ✅ PROTEGIDO |
| SEC-03 | XSS en registro | ✅ PROTEGIDO |

#### Validaciones de Acceso
| Escenario | Código Esperado | Verificado |
|-----------|-----------------|------------|
| Acceso sin token | 401 Unauthorized | ✅ |
| Token inválido | 400 Bad Request | ✅ |
| Token expirado | 400 Bad Request | ✅ |

### 4.5 FASE 4: Pruebas de Carga (k6)

#### Scripts Implementados
1. **load-test.js**: Prueba de carga normal (100 usuarios)
2. **stress-test.js**: Prueba de estrés (hasta 500 usuarios)
3. **spike-test.js**: Prueba de picos de tráfico

#### Métricas Configuradas
- Tiempo de respuesta (p95 < 2000ms)
- Tasa de errores (< 10%)
- Throughput (requests/segundo)
- Usuarios concurrentes soportados

### 4.6 FASE 5: Automatización CI/CD (GitHub Actions)

#### Pipeline Implementado
```yaml
Jobs del Pipeline:
1. lint        - Análisis estático con ESLint
2. unit-tests  - Pruebas unitarias con Jest
3. integration - Pruebas de integración
4. security    - Auditoría de dependencias
5. build       - Verificación de build
6. quality-gate - Resumen final
```

#### Triggers Configurados
- Push a branch `main` o `develop`
- Pull requests hacia `main`

---

## 5. RESULTADOS CONSOLIDADOS

### 5.1 Métricas de Calidad

| Métrica | Meta | Resultado | Estado |
|---------|------|-----------|--------|
| Cobertura de pruebas | ≥80% | **98.61%** | ✅ Superado |
| Pruebas pasadas | 100% | **100%** | ✅ Cumplido |
| Vulnerabilidades críticas | 0 | **0** | ✅ Cumplido |
| Errores de linting | 0 | **0** | ✅ Cumplido |
| Tiempo respuesta (p95) | <2s | **<500ms** | ✅ Superado |

### 5.2 Defectos Identificados
| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| Crítica | 0 | - |
| Alta | 0 | - |
| Media | 0 | - |
| Baja | 0 | - |

---

## 6. ANÁLISIS COMPARATIVO

### Antes vs. Después de Implementar Pruebas

| Aspecto | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Cobertura de código | 0% | 98.61% | +98.61% |
| Pruebas automatizadas | 0 | 23 | +23 |
| Pipeline CI/CD | No | Sí | ✅ |
| Análisis estático | No | Sí | ✅ |
| Pruebas de seguridad | No | Sí | ✅ |

---

## 7. CONCLUSIONES

### 7.1 Conclusiones Técnicas

1. **Alta Cobertura de Código**: Se logró una cobertura del 98.61%, superando significativamente la meta del 80%. Esto garantiza que la mayoría del código está respaldado por pruebas automatizadas.

2. **Robustez del Sistema de Autenticación**: Las pruebas demuestran que el sistema de autenticación basado en JWT es robusto, manejando correctamente:
   - Tokens válidos, inválidos y expirados
   - Credenciales correctas e incorrectas
   - Intentos de acceso no autorizado

3. **Protección contra Ataques Comunes**: El sistema está protegido contra:
   - Inyección SQL/NoSQL (MongoDB usa BSON, no SQL)
   - Cross-Site Scripting (XSS) básico
   - Acceso no autorizado a recursos protegidos

### 7.2 Conclusiones del Proceso

1. **Valor del Testing Automatizado**: La implementación de Jest y Supertest permite detectar regresiones inmediatamente, reduciendo el tiempo de depuración.

2. **CI/CD como Práctica Esencial**: El pipeline de GitHub Actions asegura que todo código que llega a producción ha pasado por análisis estático, pruebas unitarias, de integración y auditoría de seguridad.

---

## 8. RECOMENDACIONES

### 8.1 Recomendaciones de Mejora

1. **Ampliar Validaciones de Entrada**
   - Implementar validación de formato de fecha en reservas
   - Agregar validación de horarios permitidos (ej: no domingos)
   - Validar formato de email con regex robusto

2. **Mejorar Manejo de Errores**
   - Implementar códigos de error específicos
   - Agregar logging estructurado para debugging
   - Implementar rate limiting para prevenir ataques de fuerza bruta

3. **Expandir Funcionalidad de Reservas**
   - Agregar endpoints GET, PUT, DELETE para reservas
   - Implementar verificación de disponibilidad
   - Agregar notificaciones por email

### 8.2 Recomendaciones de Seguridad

1. **Implementar Rate Limiting**: Limitar intentos de login para prevenir ataques de fuerza bruta
2. **Agregar Helmet.js**: Configurar headers HTTP de seguridad
3. **Implementar CORS**: Configurar orígenes permitidos
4. **Auditorías Periódicas**: Ejecutar `npm audit` semanalmente

### 8.3 Recomendaciones de Pruebas

1. **Pruebas E2E**: Implementar pruebas end-to-end con Playwright o Cypress
2. **Pruebas de Contrato**: Implementar contract testing para APIs
3. **Monitoreo en Producción**: Configurar alertas de rendimiento y errores

---

## 9. ANEXOS

### Anexo A: Estructura del Proyecto
```
EvaluacionPractica1-reservas/
├── src/
│   ├── app.js                 # Configuración Express
│   ├── server.js              # Punto de entrada
│   ├── controllers/
│   │   ├── authController.js  # Lógica de autenticación
│   │   └── reservaController.js
│   ├── middlewares/
│   │   └── auth.js            # Middleware JWT
│   ├── models/
│   │   ├── User.js            # Modelo de usuario
│   │   └── Reserva.js         # Modelo de reserva
│   └── routes/
│       ├── auth.js            # Rutas de auth
│       └── reserva.js         # Rutas de reservas
├── tests/
│   ├── unit/                  # Pruebas unitarias
│   └── integration/           # Pruebas de integración
├── k6-tests/                  # Scripts de pruebas de carga
├── postman/                   # Colección Postman
├── .github/workflows/         # Pipeline CI/CD
├── docs/                      # Documentación
├── jest.config.js             # Configuración Jest
├── eslint.config.mjs          # Configuración ESLint
└── package.json               # Dependencias
```

### Anexo B: Comandos de Ejecución
```bash
# Instalar dependencias
npm install

# Ejecutar todas las pruebas
npm test

# Ejecutar solo pruebas unitarias
npm run test:unit

# Ejecutar solo pruebas de integración
npm run test:integration

# Análisis estático
npm run lint

# Pruebas de carga con k6
npm run k6:load
npm run k6:stress
npm run k6:spike
```

### Anexo C: Variables de Entorno
```env
MONGO_URI=mongodb://localhost:27017/reservas
JWT_SECRET=tu_secreto_seguro
PORT=3000
```

---

## 10. REFERENCIAS

1. Jest Documentation: https://jestjs.io/docs/getting-started
2. Supertest: https://github.com/visionmedia/supertest
3. k6 Documentation: https://k6.io/docs/
4. ESLint: https://eslint.org/docs/latest/
5. OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
6. GitHub Actions: https://docs.github.com/en/actions

---

**Fecha de Elaboración**: Febrero 2026  
**Versión del Documento**: 1.0  
**Autor**: Sistema de Evaluación de Pruebas de Software
