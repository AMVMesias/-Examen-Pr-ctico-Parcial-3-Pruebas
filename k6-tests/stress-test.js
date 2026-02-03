/**
 * FASE 4: Pruebas de Estrés con k6
 * Archivo: k6-tests/stress-test.js
 * Descripción: Pruebas de estrés para determinar el punto de ruptura del sistema
 * 
 * Ejecutar con: k6 run k6-tests/stress-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Configuración de prueba de estrés - incremento gradual hasta encontrar límites
export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },   // 100 usuarios
        { duration: '1m', target: 200 },   // 200 usuarios
        { duration: '1m', target: 300 },   // 300 usuarios
        { duration: '1m', target: 400 },   // 400 usuarios
        { duration: '1m', target: 500 },   // 500 usuarios - estrés alto
        { duration: '2m', target: 500 },   // Mantener carga alta
        { duration: '1m', target: 0 },     // Recuperación
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(99)<5000'],  // 99% < 5s
    errors: ['rate<0.3'],               // Tasa error < 30%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const user = {
    email: `stress_${timestamp}_${random}@test.com`,
    password: 'StressTest123!'
  };

  // Registro
  const registerRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(registerRes, { 'registro OK': (r) => r.status === 201 || r.status === 400 });
  errorRate.add(registerRes.status >= 500);
  responseTime.add(registerRes.timings.duration);

  // Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  });

  const loginOK = check(loginRes, { 'login OK': (r) => r.status === 200 });
  errorRate.add(!loginOK);
  responseTime.add(loginRes.timings.duration);

  if (loginOK) {
    const token = loginRes.json('token');
    
    // Crear reserva
    const reservaRes = http.post(`${BASE_URL}/api/reservas`, 
      JSON.stringify({
        fecha: '2024-02-20',
        hora: '14:00',
        sala: `Sala-Stress-${Math.floor(Math.random() * 100)}`
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    check(reservaRes, { 'reserva OK': (r) => r.status === 201 });
    errorRate.add(reservaRes.status >= 500);
    responseTime.add(reservaRes.timings.duration);
  }

  sleep(0.5);
}
