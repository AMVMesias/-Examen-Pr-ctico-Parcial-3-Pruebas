/**
 * FASE 5: Pruebas Unitarias Automatizadas con Jest
 * Archivo: tests/unit/auth.test.js
 * Descripción: Pruebas unitarias para el controlador de autenticación
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mockeamos los módulos externos
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock del modelo User
const mockUser = {
  findOne: jest.fn(),
  save: jest.fn()
};

jest.mock('../../src/models/User', () => {
  return function() {
    return {
      save: mockUser.save
    };
  };
});

const User = require('../../src/models/User');
User.findOne = mockUser.findOne;

const { register, login } = require('../../src/controllers/authController');

describe('AuthController - Pruebas Unitarias', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset de mocks antes de cada prueba
    jest.clearAllMocks();
    
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    process.env.JWT_SECRET = 'test-secret';
  });

  describe('register()', () => {
    /**
     * CP-01: Registro de usuario válido
     * Entrada: email y password válidos
     * Resultado esperado: Usuario creado (201)
     */
    test('CP-01: Debe registrar un usuario nuevo correctamente', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password123' };
      mockUser.findOne.mockResolvedValue(null);
      mockUser.save.mockResolvedValue({});
      bcrypt.hash.mockResolvedValue('hashedPassword');

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Usuario creado' });
    });

    /**
     * CP-02: Intento de registro con usuario existente
     * Entrada: email ya registrado
     * Resultado esperado: Error 400
     */
    test('CP-02: Debe rechazar registro si el usuario ya existe', async () => {
      mockReq.body = { email: 'existing@test.com', password: 'password123' };
      mockUser.findOne.mockResolvedValue({ email: 'existing@test.com' });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Ya existe el usuario' });
    });

    /**
     * CP-03: Error interno del servidor durante registro
     * Entrada: Error de base de datos
     * Resultado esperado: Error 500
     */
    test('CP-03: Debe manejar errores internos correctamente', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password123' };
      mockUser.findOne.mockRejectedValue(new Error('Database error'));

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('login()', () => {
    /**
     * CP-04: Login con credenciales válidas
     * Entrada: email y password correctos
     * Resultado esperado: Token JWT
     */
    test('CP-04: Debe autenticar usuario con credenciales válidas', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password123' };
      mockUser.findOne.mockResolvedValue({ 
        _id: 'user123', 
        email: 'test@test.com',
        password: 'hashedPassword' 
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-jwt-token');

      await login(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ token: 'fake-jwt-token' });
    });

    /**
     * CP-05: Login con usuario no existente
     * Entrada: email no registrado
     * Resultado esperado: Error 400
     */
    test('CP-05: Debe rechazar login si usuario no existe', async () => {
      mockReq.body = { email: 'noexist@test.com', password: 'password123' };
      mockUser.findOne.mockResolvedValue(null);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
    });

    /**
     * CP-06: Login con contraseña incorrecta
     * Entrada: password incorrecto
     * Resultado esperado: Error 400
     */
    test('CP-06: Debe rechazar login con contraseña incorrecta', async () => {
      mockReq.body = { email: 'test@test.com', password: 'wrongpassword' };
      mockUser.findOne.mockResolvedValue({ 
        _id: 'user123',
        email: 'test@test.com',
        password: 'hashedPassword' 
      });
      bcrypt.compare.mockResolvedValue(false);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
    });

    /**
     * CP-07: Error interno durante login
     * Entrada: Error de base de datos
     * Resultado esperado: Error 500
     */
    test('CP-07: Debe manejar errores de base de datos en login', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password123' };
      mockUser.findOne.mockRejectedValue(new Error('Connection failed'));

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Connection failed' });
    });
  });
});
