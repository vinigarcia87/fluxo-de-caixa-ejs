const { body } = require('express-validator');
const { getCategoriaById } = require('../models/CategoriaConta');
const { getTiposContaArray } = require('../models/TipoConta');
const { contaExists } = require('../models/Conta');

/**
 * Validações para criação de conta
 */
const criarContaValidation = [
  body('nomeConta')
    .notEmpty()
    .withMessage('Nome da conta é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome da conta deve ter entre 2 e 100 caracteres')
    .trim()
    .escape()
    .custom(async (nomeConta) => {
      if (contaExists(nomeConta)) {
        throw new Error('Já existe uma conta com este nome');
      }
      return true;
    }),

  body('tipoConta')
    .notEmpty()
    .withMessage('Tipo de conta é obrigatório')
    .custom((tipoConta) => {
      const tiposValidos = getTiposContaArray();
      if (!tiposValidos.includes(tipoConta)) {
        throw new Error('Tipo de conta inválido');
      }
      return true;
    }),

  body('categoriaId')
    .notEmpty()
    .withMessage('Categoria é obrigatória')
    .isInt({ min: 1 })
    .withMessage('ID da categoria deve ser um número válido')
    .custom(async (categoriaId) => {
      const categoria = getCategoriaById(parseInt(categoriaId));
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }
      return true;
    }),

  body('descricao')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim()
    .escape()
];

/**
 * Validações para atualização de conta
 */
const atualizarContaValidation = [
  body('nomeConta')
    .notEmpty()
    .withMessage('Nome da conta é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome da conta deve ter entre 2 e 100 caracteres')
    .trim()
    .escape(),
    // Nota: A validação de nome duplicado deve ser feita no service
    // considerando o ID da conta sendo editada

  body('tipoConta')
    .notEmpty()
    .withMessage('Tipo de conta é obrigatório')
    .custom((tipoConta) => {
      const tiposValidos = getTiposContaArray();
      if (!tiposValidos.includes(tipoConta)) {
        throw new Error('Tipo de conta inválido');
      }
      return true;
    }),

  body('categoriaId')
    .notEmpty()
    .withMessage('Categoria é obrigatória')
    .isInt({ min: 1 })
    .withMessage('ID da categoria deve ser um número válido')
    .custom(async (categoriaId) => {
      const categoria = getCategoriaById(parseInt(categoriaId));
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }
      return true;
    }),

  body('descricao')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim()
    .escape()
];

/**
 * Validações para conta via modal do fluxo (com possibilidade de nova categoria)
 */
const criarContaFluxoValidation = [
  body('nomeConta')
    .notEmpty()
    .withMessage('Nome da conta é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome da conta deve ter entre 2 e 100 caracteres')
    .trim()
    .escape()
    .custom(async (nomeConta) => {
      if (contaExists(nomeConta)) {
        throw new Error('Já existe uma conta com este nome');
      }
      return true;
    }),

  body('tipoConta')
    .notEmpty()
    .withMessage('Tipo de conta é obrigatório')
    .custom((tipoConta) => {
      const tiposValidos = getTiposContaArray();
      if (!tiposValidos.includes(tipoConta)) {
        throw new Error('Tipo de conta inválido');
      }
      return true;
    }),

  body('categoriaId')
    .notEmpty()
    .withMessage('Categoria é obrigatória')
    .custom(async (categoriaId, { req }) => {
      if (categoriaId === 'nova') {
        // Se for nova categoria, validar o nome da nova categoria
        const novaCategoriaNome = req.body.novaCategoriaNome;
        if (!novaCategoriaNome || novaCategoriaNome.trim().length < 2) {
          throw new Error('Nome da nova categoria é obrigatório e deve ter pelo menos 2 caracteres');
        }
        return true;
      } else {
        // Validar categoria existente
        const categoria = getCategoriaById(parseInt(categoriaId));
        if (!categoria) {
          throw new Error('Categoria não encontrada');
        }
        return true;
      }
    }),

  body('novaCategoriaNome')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome da categoria deve ter entre 2 e 100 caracteres')
    .trim()
    .escape(),

  body('ano')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Ano inválido')
];

/**
 * Validações para atualização da ordem das contas
 */
const atualizarOrdemContasValidation = [
  body('novaOrdem')
    .notEmpty()
    .withMessage('Nova ordem é obrigatória')
    .isArray({ min: 1 })
    .withMessage('Nova ordem deve ser um array não vazio'),

  body('novaOrdem.*')
    .isInt({ min: 1 })
    .withMessage('Cada item da ordem deve ser um ID válido')
];

module.exports = {
  criarContaValidation,
  atualizarContaValidation,
  criarContaFluxoValidation,
  atualizarOrdemContasValidation
};