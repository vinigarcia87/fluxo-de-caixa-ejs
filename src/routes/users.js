/**
 * Rotas de Usuários - Nova Arquitetura MVC
 * Usa Controller, Service, Model e Validations
 */

import express from 'express';
import multer from 'multer';

const router = express.Router();

// Controller e Validações (usando createRequire para CommonJS modules)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const UserController = require('../controllers/UserController');
const {
  createUserValidation,
  updateUserValidation,
  searchUserValidation,
  photoValidation,
  validateRouteParams,
  sanitizeUserData,
  logValidationErrors
} = require('../validations/userValidation');

// Configuração do Multer para upload de imagens
const storage = multer.memoryStorage(); // Armazena em memória para processamento
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  }
});

// Middleware Multer que funciona com ou sem arquivo
const optionalUpload = (req, res, next) => {
  upload.single('foto')(req, res, (err) => {
    // Ignorar erros de Multer quando não há arquivo
    if (err && !req.file) {
      console.log('[MULTER] Processando sem arquivo, ignorando erro:', err.message);
    } else if (err) {
      // Apenas reportar erros reais de arquivo
      return next(err);
    }
    next();
  });
};

// ============================================================================
// MIDDLEWARE ESPECÍFICO PARA VALIDAÇÃO DE PARÂMETROS (aplicado individualmente)
// ============================================================================

// ============================================================================
// ROTAS DE INTERFACE (HTML)
// ============================================================================

/**
 * GET /users - Listar todos os usuários
 */
router.get('/', UserController.getUsers);

/**
 * GET /users/search - Buscar usuários (deve vir antes de /:id)
 */
router.get('/search', searchUserValidation, UserController.searchUsers);

/**
 * GET /users/add - Formulário para novo usuário (deve vir antes de /:id)
 */
router.get('/add', UserController.getCreateUserForm);

/**
 * POST /users/add - Criar novo usuário (deve vir antes de /:id)
 */
router.post('/add',
  optionalUpload,
  photoValidation,
  createUserValidation,
  sanitizeUserData,
  logValidationErrors,
  UserController.createUser
);

/**
 * GET /users/:id - Visualizar detalhes do usuário (rota genérica deve vir por último)
 */
router.get('/:id', validateRouteParams, UserController.getUserDetails);

// ============================================================================
// ROTAS DE API (JSON) - Devem vir antes das rotas genéricas /:id
// ============================================================================

/**
 * GET /users/api/list - Listar usuários (API)
 */
router.get('/api/list', UserController.getUsersAPI);

/**
 * GET /users/api/stats - Estatísticas dos usuários (API)
 */
router.get('/api/stats', UserController.getUserStatsAPI);

/**
 * GET /users/api/:id/exists - Verificar se usuário existe (API)
 */
router.get('/api/:id/exists', validateRouteParams, UserController.checkUserExists);

// ============================================================================
// ROTAS COM PARÂMETROS :id (devem vir por último)
// ============================================================================

/**
 * GET /users/:id/edit - Formulário para editar usuário
 */
router.get('/:id/edit', validateRouteParams, UserController.getEditUserForm);

/**
 * POST /users/:id/edit - Atualizar usuário
 */
router.post('/:id/edit',
  validateRouteParams,
  optionalUpload,
  photoValidation,
  updateUserValidation,
  sanitizeUserData,
  logValidationErrors,
  UserController.updateUser
);

/**
 * POST /users/:id/delete - Remover usuário
 */
router.post('/:id/delete', validateRouteParams, UserController.deleteUser);

// ============================================================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================================================

/**
 * Middleware para tratar erros de upload
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      req.flash('error', 'Arquivo muito grande. Máximo 5MB permitido.');
    } else {
      req.flash('error', 'Erro no upload do arquivo.');
    }
    return res.redirect(req.originalUrl);
  }

  if (error.message === 'Apenas arquivos de imagem são permitidos!') {
    req.flash('error', error.message);
    return res.redirect(req.originalUrl);
  }

  next(error);
});

export default router;