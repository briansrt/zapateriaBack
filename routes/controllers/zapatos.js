const getClient = require("../../db/mongo");
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');


const crearCompra = async (req, res) => {
  const client = await getClient();
  const { userId, nombre, productos } = req.body;

    try {
        const currentDateTime = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
        await client.db('zapateria').collection('compras').insertOne({ 
            userId: new ObjectId(userId), 
            fecha: currentDateTime, 
            productos,
            nombre,
        });
        res.json({ status: "Pago realizado", fecha: currentDateTime });
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
}

const getCompras = async (req, res) => {
  const client = await getClient();
  const { userId } = req.body;
    try {
        const compras = await client.db('zapateria').collection('compras').find({ userId: new ObjectId(userId) }).toArray();
        res.json(compras);
    } catch (error) {
        console.error('Error al obtener las compras:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
}

const getProductos = async (req, res) => {
  const client = await getClient();
    try {
        const productos = await client.db('zapateria').collection('productos').find().toArray();
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
}

const getTodasCompras = async (req, res) => {
  const client = await getClient();
    try {
        const compras = await client.db('zapateria').collection('compras').aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $project: {
                    fecha: 1,
                    productos: 1,
                    nombre: 1,
                    userEmail: '$userDetails.email'
                }
            }
        ]).toArray();

        res.json(compras);
    } catch (error) {
        console.error('Error al obtener todas las compras:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
}

const estadisticas = async (req, res) => {
  const client = await getClient();
  try {
    const db = client.db("zapateria");

    // Total de ventas
    const totalVentas = await db.collection("compras").aggregate([
      { $unwind: "$productos" },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$productos.valor" } }
        }
      }
    ]).toArray();

    // Productos más vendidos
    const productosMasVendidos = await db.collection("compras").aggregate([
      { $unwind: "$productos" },
      {
        $group: {
          _id: "$productos.producto",
          cantidad: { $sum: { $toInt: "$productos.cantidad" } }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          producto: "$_id",
          cantidad: 1
        }
      }
    ]).toArray();

    // Ventas por mes
    const ventasPorMes = await db.collection("compras").aggregate([
      {
        $addFields: {
          fechaConvertida: {
            $dateFromString: {
              dateString: "$fecha",
              format: "%Y-%m-%d %H:%M:%S"
            }
          }
        }
      },
      { $unwind: "$productos" },
      {
        $group: {
          _id: {
            year: { $year: "$fechaConvertida" },
            month: { $month: "$fechaConvertida" }
          },
          totalVentas: { $sum: { $toDouble: "$productos.valor" } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).toArray();

    res.json({
      totalVentas: totalVentas[0]?.total || 0,
      productosMasVendidos,
      ventasPorMes
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};


module.exports = { crearCompra, getCompras, getProductos, getTodasCompras, estadisticas };
