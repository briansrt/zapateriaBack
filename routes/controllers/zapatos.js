const getClient = require("../../db/mongo");
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');


const crearCompra = async (req, res) => {
  const client = await getClient();
  const { userId, productos, total } = req.body;

    try {
        const currentDateTime = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
        const productosConId = productos.map(p => ({
          ...p,
          productoId: new ObjectId(p.productoId)
        }));


        await client.db('zapateria').collection('compras').insertOne({ 
            userId: userId,
            fecha: currentDateTime, 
            productos: productosConId,
            total,
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
    const compras = await client
      .db("zapateria")
      .collection("compras")
      .aggregate([
        { $match: { userId: userId } }, // 👈 aquí como string
        { $unwind: "$productos" },
        {
          $lookup: {
            from: "productos",
            localField: "productos.productoId",
            foreignField: "_id",
            as: "productoInfo",
          },
        },
        { $unwind: "$productoInfo" },
        {
          $project: {
            _id: 1,
            userId: 1,
            total: 1,
            fecha: 1,
            "productos.cantidad": 1,
            "productos.valor": 1,
            "productoInfo.nombre": 1,
            "productoInfo.categoria": 1,
            "productoInfo.marca": 1,
            "productoInfo.img": 1,
          },
        },
      ])
      .toArray();

    res.json(compras);
  } catch (error) {
    console.error("Error al obtener las compras:", error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};


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

    // 🟢 Total de ventas (usar el campo total de la compra)
    const totalVentas = await db.collection("compras").aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$total" } }
        }
      }
    ]).toArray();

    // 🟢 Productos más vendidos (sumar cantidad de cada productoId)
    const productosMasVendidos = await db.collection("compras").aggregate([
      { $unwind: "$productos" },
      {
        $group: {
          _id: "$productos.productoId", // ahora es ObjectId
          cantidad: { $sum: { $toInt: "$productos.cantidad" } }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 5 },
      // 👇 hacemos lookup a productos para traer info
      {
        $lookup: {
          from: "productos",
          localField: "_id",
          foreignField: "_id",
          as: "productoInfo"
        }
      },
      { $unwind: "$productoInfo" },
      {
        $project: {
          _id: 0,
          productoId: "$_id",
          cantidad: 1,
          nombre: "$productoInfo.nombre",
          categoria: "$productoInfo.categoria",
          marca: "$productoInfo.marca",
          img: "$productoInfo.img"
        }
      }
    ]).toArray();

    // 🟢 Ventas por mes (usar campo total en compras, no por producto)
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
      {
        $group: {
          _id: {
            year: { $year: "$fechaConvertida" },
            month: { $month: "$fechaConvertida" }
          },
          totalVentas: { $sum: { $toDouble: "$total" } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          mes: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          totalVentas: 1
        }
      }
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
