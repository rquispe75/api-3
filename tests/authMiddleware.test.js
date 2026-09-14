process.env.JWT_SECRET = 'mi_clave_secreta';

const jwt = require('jsonwebtoken');
const { verificarToken } = require('../src/middlewares/authMiddleware');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Suite: Middleware de Autenticación (JWT)', () => {
  test('Debe bloquear si no hay Token', () => {
    const req = { headers: {} };
    const res = mockResponse();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('Debe bloquear si el Token es inválido', () => {
    const req = { headers: { authorization: 'Bearer token.invalido.falso' } };
    const res = mockResponse();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('Debe permitir el paso y adjuntar req.usuario si el Token es válido', () => {
    const token = jwt.sign({ id: 5, rol: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockResponse();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario).toMatchObject({ id: 5, rol: 1 });
  });
});
