const express = require('express');
const router = express.Router();
const {crearCompra, getCompras, getProductos, getTodasCompras, estadisticas } = require('./controllers/zapatos.js');

router.post('/crearCompra', crearCompra);
/*
  #swagger.tags = ['Zapatos']
  #swagger.description = 'Registra una nueva compra realizada por el usuario.'
  #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos de la compra',
      required: true,
      schema: {
          userId: '6754ab12c8f1b45c12345678',
          productos: [
              {
                  productoId: '671234abcd9876543210ef12',
                  cantidad: 2,
                  valor: 50000
              }
          ],
          total: 100000
      }
  }
  #swagger.responses[200] = {
      description: 'Compra registrada exitosamente',
      schema: { status: 'Pago realizado', fecha: '2025-11-03 14:00:00' }
  }
  #swagger.responses[500] = { description: 'Error interno del servidor' }
*/
router.post('/getCompras', getCompras);
/*
  #swagger.tags = ['Zapatos']
  #swagger.description = 'Obtiene las compras de un usuario específico.'
*/
router.get('/getProductos', getProductos);
/*
  #swagger.tags = ['Zapatos']
  #swagger.description = 'Obtiene todos los productos disponibles en la zapatería.'
*/
router.get('/getTodasCompras', getTodasCompras);
/*
  #swagger.tags = ['Zapatos']
  #swagger.description = 'Obtiene todas las compras realizadas por todos los usuarios.'
*/
router.get('/estadisticas', estadisticas);
/*
  #swagger.tags = ['Zapatos']
  #swagger.description = 'Devuelve estadísticas generales de ventas y productos más vendidos.'
*/

module.exports = router;