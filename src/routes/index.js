import express from 'express';
const router = express.Router();

/* GET home page - with nodemon hot reload! */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Sistema Fluxo de Caixa' });
});

export default router;
