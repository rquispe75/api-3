// Requisito: Min 8 chars, 1 mayúscula, 1 número
const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

/* Desglose de la RegEx:
 * (?=.*[A-Z]) -> Lookahead: Obliga a tener Mayúscula
 * (?=.*\d)    -> Lookahead: Obliga a tener Número
 * {8,}        -> Longitud mínima de 8 caracteres
 */

module.exports = { passRegex };
