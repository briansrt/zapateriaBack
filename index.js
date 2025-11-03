const express = require('express');
const {urlencoded, json} = require('express');
const cors = require('cors');
const path = require("path");
require('dotenv').config();
const userRoutes = require('./routes/userRoutes.routes.js');
const zapatosRoutes = require('./routes/zapatosRoutes.routes.js');

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

const port = process.env.PORT;

const app = express();

app.use(urlencoded({extended: true}))
app.use(json())

app.use(cors())

app.get("/api-docs", (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>API Docs</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
      <script>
        SwaggerUIBundle({
          url: '/swagger-output.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
        });
      </script>
    </body>
  </html>`;
  res.send(html);
});


app.use('/user', userRoutes);
app.use('/zapatos', zapatosRoutes);

app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});

app.listen(port, ()=>{
    console.log(`listening at port http://localhost:${port}`);
})