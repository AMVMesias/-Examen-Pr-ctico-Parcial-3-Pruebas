/**
 * FASE 5: Pruebas Unitarias del Middleware de Autenticación
 * Archivo: tests/unit/authMiddleware.test.js
 * Descripción: Pruebas unitarias para el middleware de autenticación JWT
 */

const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

const authMiddleware = require('../../src/middlewares/auth');

describe('Auth Middleware - Pruebas Unitarias', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      header: jest.fn()
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Verificación de Token JWT', () => {
    /**
     * CP-11: Acceso sin token de autenticación
     * Entrada: Sin header Authorization
     * Resultado esperado: 401 Unauthorized
     */
    test('CP-11: Debe rechazar acceso sin token', () => {
      mockReq.header.mockReturnValue(undefined);

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Acceso denegado' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    /**
     * CP-12: Acceso con token válido
     * Entrada: Token JWT válido
     * Resultado esperado: Llamar a next()
     */
    test('CP-12: Debe permitir acceso con token válido', () => {
      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify.mockReturnValue({ id: 'user123' });

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({ id: 'user123' });
      expect(mockNext).toHaveBeenCalled();
    });

    /**
     * CP-13: Acceso con token inválido
     * Entrada: Token JWT inválido/manipulado
     * Resultado esperado: 400 Token inválido
     */
    test('CP-13: Debe rechazar token inválido', () => {
      mockReq.header.mockReturnValue('Bearer invalid-token');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    /**
     * CP-14: Acceso con token expirado
     * Entrada: Token JWT expirado
     * Resultado esperado: 400 Token inválido
     */
    test('CP-14: Debe rechazar token expirado', () => {
      mockReq.header.mockReturnValue('Bearer expired-token');
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    });

    /**
     * CP-15: Token sin prefijo Bearer
     * Entrada: Token sin formato correcto
     * Resultado esperado: Token procesado correctamente
     */
    test('CP-15: Debe procesar token sin prefijo Bearer', () => {
      mockReq.header.mockReturnValue('valid-token-without-bearer');
      jwt.verify.mockReturnValue({ id: 'user123' });

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
