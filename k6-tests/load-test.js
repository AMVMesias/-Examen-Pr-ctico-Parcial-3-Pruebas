/**
 * FASE 4: Pruebas de Carga y Rendimiento con k6
 * Archivo: k6-tests/load-test.js
 * Descripción: Script de pruebas de carga para la API de reservas
 * 
 * Ejecutar con: k6 run k6-tests/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const reservaDuration = new Trend('reserva_duration');
const successfulLogins = new Counter('successful_logins');
const successfulReservas = new Counter('successful_reservas');

// Configuración de escenarios de carga
export const options = {
  scenarios: {
    // Escenario 1: Carga normal - 100 usuarios
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },   // Rampa de subida
        { duration: '1m', target: 100 },   // 100 usuarios concurrentes
        { duration: '30s', target: 0 },    // Rampa de bajada
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de requests < 2s
    errors: ['rate<0.1'],              // Tasa de error < 10%
    http_req_failed: ['rate<0.1'],     // Requests fallidos < 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Datos de prueba
function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    email: `test_${timestamp}_${random}@loadtest.com`,
    password: 'LoadTest123!'
  };
}

export default function() {
  const user = generateTestUser();
  let token = null;

  group('Registro de Usuario', function() {
    const registerPayload = JSON.stringify(user);
    const registerResponse = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'register' }
    });

    check(registerResponse, {
      'registro exitoso': (r) => r.status === 201,
      'mensaje de confirmación': (r) => r.json('msg') === 'Usuario creado',
    });

    errorRate.add(registerResponse.status !== 201);
    sleep(1);
  });

  group('Login de Usuario', function() {
    const loginStart = Date.now();
    const loginPayload = JSON.stringify(user);
    const loginResponse = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login' }
    });

    const loginSuccess = check(loginResponse, {
      'login exitoso': (r) => r.status === 200,
      'token recibido': (r) => r.json('token') !== undefined,
    });

    loginDuration.add(Date.now() - loginStart);
    
    if (loginSuccess) {
      token = loginResponse.json('token');
      successfulLogins.add(1);
    }
    
    errorRate.add(!loginSuccess);
    sleep(1);
  });

  if (token) {
    group('Crear Reserva', function() {
      const reservaStart = Date.now();
      const reservaPayload = JSON.stringify({
        fecha: '2024-01-15',
        hora: '10:00',
        sala: `Sala-${Math.floor(Math.random() * 10)}`
      });

      const reservaResponse = http.post(`${BASE_URL}/api/reservas`, reservaPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        tags: { name: 'crear_reserva' }
      });

      const reservaSuccess = check(reservaResponse, {
        'reserva creada': (r) => r.status === 201,
        'mensaje de confirmación': (r) => r.json('msg') === 'Reserva creada',
      });

      reservaDuration.add(Date.now() - reservaStart);
      
      if (reservaSuccess) {
        successfulReservas.add(1);
      }
      
      errorRate.add(!reservaSuccess);
      sleep(1);
    });
  }

  sleep(Math.random() * 2);
}

export function handleSummary(data) {
  return {
    'docs/k6-load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const { metrics } = data;
  let output = '\n========== RESUMEN DE PRUEBAS DE CARGA ==========\n\n';
  
  output += '📊 MÉTRICAS PRINCIPALES:\n';
  output += `   - Requests totales: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `   - Tiempo respuesta (p95): ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 0}ms\n`;
  output += `   - Tasa de errores: ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  output += `   - Logins exitosos: ${metrics.successful_logins?.values?.count || 0}\n`;
  output += `   - Reservas exitosas: ${metrics.successful_reservas?.values?.count || 0}\n`;
  
  output += '\n================================================\n';
  
  return output;
}
