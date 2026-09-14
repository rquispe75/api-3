const { passRegex } = require('../src/utils/validadores');

describe('Suite: Seguridad de Contraseñas', () => {
  test('1. Rechaza longitud menor a 8 caracteres', () => {
    expect(passRegex.test('A1bc')).toBe(false);
  });

  test('2. Rechaza contraseñas sin mayúscula', () => {
    expect(passRegex.test('abcdefg1')).toBe(false);
  });

  test('3. Rechaza contraseñas sin número', () => {
    expect(passRegex.test('Abcdefgh')).toBe(false);
  });

  test('4. Rechaza contraseña vacía', () => {
    expect(passRegex.test('')).toBe(false);
  });

  test('5. Acepta una contraseña válida (mayúscula + número + 8 caracteres)', () => {
    expect(passRegex.test('Abcdefg1')).toBe(true);
  });

  test('6. Acepta una contraseña válida más larga', () => {
    expect(passRegex.test('MiClaveSegura123')).toBe(true);
  });

  test('7. Rechaza contraseñas con caracteres especiales (sólo se permiten letras y números)', () => {
    expect(passRegex.test('Abcdefg1!@#')).toBe(false);
  });

  test('8. Rechaza si sólo tiene números y minúsculas (sin mayúscula)', () => {
    expect(passRegex.test('12345678')).toBe(false);
  });

  test('9. Rechaza si sólo tiene letras (mayúsculas y minúsculas, sin número)', () => {
    expect(passRegex.test('AbcdefghIJK')).toBe(false);
  });

  test('10. Rechaza cuando password es undefined', () => {
    expect(() => passRegex.test(undefined)).not.toThrow();
    expect(passRegex.test(undefined)).toBe(false);
  });
});
