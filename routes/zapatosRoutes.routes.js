const express = require('express');
const router = express.Router();
const {crearCompra, getCompras, getTodasCompras, estadisticas } = require('./controllers/zapatos.js');

router.post('/crearCompra', crearCompra);
router.post('/getCompras', getCompras);
router.get('/getTodasCompras', getTodasCompras);
router.get('/estadisticas', estadisticas);


module.exports = router;