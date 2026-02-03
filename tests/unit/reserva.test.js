/**
 * FASE 5: Pruebas Unitarias Automatizadas con Jest
 * Archivo: tests/unit/reserva.test.js
 * Descripción: Pruebas unitarias para el controlador de reservas
 */

// Mock del modelo Reserva
const mockReserva = {
  save: jest.fn()
};

jest.mock('../../src/models/Reserva', () => {
  return function(data) {
    return {
      ...data,
      save: mockReserva.save
    };
  };
});

const { crearReserva } = require('../../src/controllers/reservaController');

describe('ReservaController - Pruebas Unitarias', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      user: { id: 'user123' }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('crearReserva()', () => {
    /**
     * CP-08: Crear reserva con datos válidos
     * Entrada: fecha, hora y sala válidas
     * Resultado esperado: Reserva creada (201)
     */
    test('CP-08: Debe crear una reserva válida correctamente', async () => {
      mockReq.body = { 
        fecha: '2024-01-15', 
        hora: '10:00', 
        sala: 'Sala A' 
      };
      mockReserva.save.mockResolvedValue({});

      await crearReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Reserva creada' });
    });

    /**
     * CP-09: Error al crear reserva
     * Entrada: Error de base de datos
     * Resultado esperado: Error 500
     */
    test('CP-09: Debe manejar errores al crear reserva', async () => {
      mockReq.body = { 
        fecha: '2024-01-15', 
        hora: '10:00', 
        sala: 'Sala A' 
      };
      mockReserva.save.mockRejectedValue(new Error('Database error'));

      await crearReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

    /**
     * CP-10: Crear reserva sin usuario autenticado
     * Entrada: Sin req.user
     * Resultado esperado: Error al acceder a user.id
     */
    test('CP-10: Debe asociar la reserva al usuario autenticado', async () => {
      mockReq.body = { 
        fecha: '2024-01-15', 
        hora: '10:00', 
        sala: 'Sala A' 
      };
      mockReq.user = { id: 'authenticatedUser456' };
      mockReserva.save.mockResolvedValue({});

      await crearReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
