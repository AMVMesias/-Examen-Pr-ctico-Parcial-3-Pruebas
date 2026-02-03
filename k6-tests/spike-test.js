/**
 * FASE 4: Pruebas de Pico (Spike Testing) con k6
 * Archivo: k6-tests/spike-test.js
 * Descripción: Simula picos repentinos de tráfico para evaluar la respuesta del sistema
 * 
 * Ejecutar con: k6 run k6-tests/spike-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Configuración de prueba de picos
export const options = {
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 10 },    // Carga normal
        { duration: '10s', target: 500 },   // PICO REPENTINO
        { duration: '1m', target: 500 },    // Mantener pico
        { duration: '10s', target: 10 },    // Bajada rápida
        { duration: '30s', target: 10 },    // Recuperación
        { duration: '10s', target: 0 },     // Final
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    errors: ['rate<0.5'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function() {
  const user = {
    email: `spike_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@test.com`,
    password: 'SpikeTest123!'
  };

  // Flujo completo de usuario
  const registerRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  errorRate.add(registerRes.status >= 500);

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  });

  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    
    const reservaRes = http.post(`${BASE_URL}/api/reservas`,
      JSON.stringify({
        fecha: '2024-03-10',
        hora: '09:00',
        sala: 'Sala-Spike'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    errorRate.add(reservaRes.status >= 500);
  }

  sleep(0.3);
}
