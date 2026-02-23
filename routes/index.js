var express = require('express');
var router = express.Router();

/* GET home page - with nodemon hot reload! */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Sistema Fluxo de Caixa' });
});

module.exports = router;
