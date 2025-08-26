const express = require('express');
const {urlencoded, json} = require('express');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes.routes.js');
const zapatosRoutes = require('./routes/zapatosRoutes.routes.js');

const port = process.env.PORT;

const app = express();

app.use(urlencoded({extended: true}))
app.use(json())

app.use(cors())
app.use('/user', userRoutes);
app.use('/zapatos', zapatosRoutes);

app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});

app.listen(port, ()=>{
    console.log(`listening at port http://localhost:${port}`);
})
