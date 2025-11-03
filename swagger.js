const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "API Zapatería",
    description: "Documentación de la API para la gestión de compras y productos.",
  },
  host: "https://zapateria-back.vercel.app",
  schemes: ["https"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
