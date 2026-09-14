const express = require('express');
const router = express.Router();

// Ruta mínima para roles (placeholder)
router.get('/roles', (req, res) => {
  res.json({ roles: [] });
});

module.exports = router;
