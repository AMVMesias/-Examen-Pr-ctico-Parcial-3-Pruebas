/**
 * FASE 4: Prueba de Carga Simplificada con k6
 * Archivo: k6-tests/simple-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const user = {
    email: `load_${timestamp}_${random}@test.com`,
    password: 'LoadTest123!'
  };

  // Registro
  const registerRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  });
  check(registerRes, { 'registro OK': (r) => r.status === 201 });

  // Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    
    // Crear reserva
    const reservaRes = http.post(`${BASE_URL}/api/reservas`,
      JSON.stringify({
        fecha: '2024-02-15',
        hora: '10:00',
        sala: `Sala-${Math.floor(Math.random() * 10)}`
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    check(reservaRes, { 'reserva OK': (r) => r.status === 201 });
  }

  sleep(0.5);
}
