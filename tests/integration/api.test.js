/**
 * FASE 2 & 5: Pruebas de Integración con Supertest
 * Archivo: tests/integration/api.test.js
 * Descripción: Pruebas de integración de la API REST completa
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

// Configuración antes de todas las pruebas
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Configurar variables de entorno para pruebas
  process.env.MONGO_URI = mongoUri;
  process.env.JWT_SECRET = 'test-secret-key-for-testing';
  
  // Cerrar conexiones existentes
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Importar app después de configurar env
  app = require('../../src/app');
});

// Limpieza después de todas las pruebas
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Limpieza entre pruebas
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('API REST - Pruebas de Integración', () => {
  
  describe('POST /api/auth/register', () => {
    /**
     * CP-INT-01: Registro exitoso de nuevo usuario
     */
    test('CP-INT-01: Debe registrar un nuevo usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'nuevo@usuario.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.msg).toBe('Usuario creado');
    });

    /**
     * CP-INT-02: Rechazar registro duplicado
     */
    test('CP-INT-02: Debe rechazar registro de usuario duplicado', async () => {
      // Primer registro
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicado@test.com',
          password: 'password123'
        });

      // Intento de registro duplicado
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicado@test.com',
          password: 'password456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Ya existe el usuario');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@test.com',
          password: 'password123'
        });
    });

    /**
     * CP-INT-03: Login exitoso con credenciales válidas
     */
    test('CP-INT-03: Debe autenticar con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    /**
     * CP-INT-04: Login fallido con contraseña incorrecta
     */
    test('CP-INT-04: Debe rechazar login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    /**
     * CP-INT-05: Login fallido con usuario inexistente
     */
    test('CP-INT-05: Debe rechazar login de usuario no registrado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('POST /api/reservas', () => {
    let authToken;

    beforeEach(async () => {
      // Registrar y autenticar usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'reservas@test.com',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'reservas@test.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    /**
     * CP-INT-06: Crear reserva con autenticación válida
     */
    test('CP-INT-06: Debe crear reserva con token válido', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fecha: '2024-01-15',
          hora: '10:00',
          sala: 'Sala A'
        });

      expect(response.status).toBe(201);
      expect(response.body.msg).toBe('Reserva creada');
    });

    /**
     * CP-INT-07: Rechazar reserva sin autenticación
     */
    test('CP-INT-07: Debe rechazar reserva sin token', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .send({
          fecha: '2024-01-15',
          hora: '10:00',
          sala: 'Sala A'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Acceso denegado');
    });

    /**
     * CP-INT-08: Rechazar reserva con token inválido
     */
    test('CP-INT-08: Debe rechazar reserva con token inválido', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', 'Bearer invalid-token-here')
        .send({
          fecha: '2024-01-15',
          hora: '10:00',
          sala: 'Sala A'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token inválido');
    });
  });
});
