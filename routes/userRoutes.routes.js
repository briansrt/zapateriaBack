const express = require('express');
const router = express.Router();
const {login, crearUser} = require('./controllers/user.js');

router.post('/login', login);
router.post('/crearUser', crearUser);

module.exports = router;