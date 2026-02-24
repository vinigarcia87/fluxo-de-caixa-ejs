/**
 * Validações para operações de usuários
 */

import { body, validationResult } from 'express-validator';
import { emailExists, cpfExists } from '../models/User.js';

/**
 * Validar CPF
 */
function isValidCPF(cpf) {
  // Verificar se CPF existe e é uma string
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se o CPF tem 11 dígitos e se todos os dígitos são iguais
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  // Cálculo do primeiro dígito verificador
  let soma = 0;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  let resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;

  // Verifica o primeiro dígito verificador
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Cálculo do segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;

  // Verifica o segundo dígito verificador
  return resto === parseInt(cpf.substring(10, 11));
}

/**
 * Validações para criação de usuário
 */
const createUserValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim()
    .escape(),

  body('email')
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .custom((email) => {
      if (emailExists(email)) {
        throw new Error('Email já cadastrado');
      }
      return true;
    }),

  body('telefone')
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX')
    .trim(),

  body('cpf')
    .notEmpty()
    .withMessage('CPF é obrigatório')
    .custom((cpf) => {
      // Só validar se o CPF existir e não for vazio
      if (cpf && cpf.trim() !== '') {
        if (!isValidCPF(cpf)) {
          throw new Error('CPF inválido');
        }
        if (cpfExists(cpf)) {
          throw new Error('CPF já cadastrado');
        }
      }
      return true;
    })
];

/**
 * Validações para atualização de usuário
 */
const updateUserValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim()
    .escape(),

  body('email')
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .custom((email, { req }) => {
      const userId = parseInt(req.params.id);
      if (emailExists(email, userId)) {
        throw new Error('Email já cadastrado');
      }
      return true;
    }),

  body('telefone')
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX')
    .trim(),

  body('cpf')
    .notEmpty()
    .withMessage('CPF é obrigatório')
    .custom((cpf, { req }) => {
      // Só validar se o CPF existir e não for vazio
      if (cpf && cpf.trim() !== '') {
        if (!isValidCPF(cpf)) {
          throw new Error('CPF inválido');
        }
        const userId = parseInt(req.params.id);
        if (cpfExists(cpf, userId)) {
          throw new Error('CPF já cadastrado');
        }
      }
      return true;
    })
];

/**
 * Validação para busca de usuários
 */
const searchUserValidation = [
  body('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Termo de busca deve ter no máximo 100 caracteres')
    .trim()
    .escape()
];

/**
 * Validação de arquivo de foto com logging detalhado
 */
const photoValidation = (req, res, next) => {
  // Log da validação de foto
  const fileInfo = req.file ? {
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: `${req.file.size} bytes`,
    sizeFormatted: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`
  } : null;

  console.log(`[VALIDATION] ${new Date().toISOString()} 📷 Validando upload de foto`, {
    url: req.originalUrl,
    hasFile: !!req.file,
    fileInfo
  });

  // Verificar se há arquivo
  if (!req.file) {
    console.log(`[VALIDATION] ${new Date().toISOString()} ℹ️ Nenhuma foto enviada (opcional)`);
    return next(); // Foto é opcional
  }

  // Verificar tipo de arquivo
  if (!req.file.mimetype.startsWith('image/')) {
    console.warn(`[VALIDATION] ${new Date().toISOString()} ❌ Tipo de arquivo inválido`, {
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
      url: req.originalUrl
    });

    return res.status(400).json({
      success: false,
      message: 'Apenas arquivos de imagem são permitidos'
    });
  }

  // Verificar tamanho (5MB)
  if (req.file.size > 5 * 1024 * 1024) {
    console.warn(`[VALIDATION] ${new Date().toISOString()} ❌ Arquivo muito grande`, {
      size: `${req.file.size} bytes`,
      sizeFormatted: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      limit: '5 MB',
      filename: req.file.originalname,
      url: req.originalUrl
    });

    return res.status(400).json({
      success: false,
      message: 'Arquivo deve ter no máximo 5MB'
    });
  }

  console.log(`[VALIDATION] ${new Date().toISOString()} ✅ Foto válida`, fileInfo);
  next();
};

/**
 * Validação de ID de usuário
 */
const validateUserId = [
  body('id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido')
];

/**
 * Sanitização de dados de usuário
 */
const sanitizeUserData = [
  body('nome').trim().escape(),
  body('email').normalizeEmail(),
  body('telefone').trim(),
  body('cpf').customSanitizer(value => {
    // Remove formatação do CPF para armazenamento consistente
    return value ? value.replace(/[^\d]/g, '') : value;
  })
];

/**
 * Validação para parâmetros de rota
 */
const validateRouteParams = (req, res, next) => {
  const { id } = req.params;

  // Log detalhado da validação de parâmetros
  console.log(`[VALIDATION] ${new Date().toISOString()} 🔍 Validando parâmetro ID`, {
    url: req.originalUrl,
    method: req.method,
    id: id,
    isValid: id ? !isNaN(id) && parseInt(id) >= 1 : 'no-id'
  });

  if (id && (isNaN(id) || parseInt(id) < 1)) {
    console.warn(`[VALIDATION] ${new Date().toISOString()} ❌ ID inválido rejeitado`, {
      url: req.originalUrl,
      id: id,
      reason: isNaN(id) ? 'not-a-number' : 'less-than-one'
    });

    return res.status(400).render('error', {
      message: 'ID de usuário inválido',
      error: { status: 400 }
    });
  }

  console.log(`[VALIDATION] ${new Date().toISOString()} ✅ Parâmetro ID válido`, {
    url: req.originalUrl,
    id: id || 'no-id-required'
  });

  next();
};

/**
 * Middleware para logar erros de validação do express-validator
 */
const logValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Log detalhado dos erros de validação
    const errorDetails = errors.array().map(error => ({
      field: error.param || error.path,
      value: typeof error.value === 'string' && error.value.length > 50
        ? error.value.substring(0, 50) + '...'
        : error.value,
      message: error.msg,
      location: error.location
    }));

    console.warn(`[VALIDATION] ${new Date().toISOString()} ⚠️ Erros de validação encontrados`, {
      url: req.originalUrl,
      method: req.method,
      errorCount: errors.array().length,
      errors: errorDetails,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else {
    console.log(`[VALIDATION] ${new Date().toISOString()} ✅ Todas as validações passaram`, {
      url: req.originalUrl,
      method: req.method,
      fields: Object.keys(req.body)
    });
  }

  next();
};

// Exportações ES modules
export {
  createUserValidation,
  updateUserValidation,
  searchUserValidation,
  photoValidation,
  validateUserId,
  sanitizeUserData,
  validateRouteParams,
  logValidationErrors,
  isValidCPF
};
