const { body } = require('express-validator');
const { getContaById } = require('../../models/Conta');

/**
 * Validações para criação de movimentação
 */
const criarMovimentacaoValidation = [
  body('contaId')
    .notEmpty()
    .withMessage('Conta é obrigatória')
    .isInt({ min: 1 })
    .withMessage('ID da conta deve ser um número válido')
    .custom(async (contaId) => {
      const conta = getContaById(parseInt(contaId));
      if (!conta) {
        throw new Error('Conta não encontrada');
      }
      return true;
    }),

  body('data')
    .notEmpty()
    .withMessage('Data é obrigatória')
    .isISO8601()
    .withMessage('Data deve estar em formato válido (YYYY-MM-DD)')
    .custom((data) => {
      const dataObj = new Date(data);
      const hoje = new Date();
      const umAnoAtras = new Date();
      umAnoAtras.setFullYear(hoje.getFullYear() - 1);

      if (dataObj > hoje) {
        throw new Error('Data não pode ser no futuro');
      }

      // Opcional: limite para não aceitar datas muito antigas
      if (dataObj < umAnoAtras) {
        throw new Error('Data não pode ser anterior a um ano');
      }

      return true;
    }),

  body('valor')
    .notEmpty()
    .withMessage('Valor é obrigatório')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero')
    .custom((valor) => {
      const valorFloat = parseFloat(valor);
      if (valorFloat > 999999999.99) {
        throw new Error('Valor muito alto');
      }
      return true;
    })
    .toFloat(),

  body('descricao')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim()
    .escape()
];

/**
 * Validações para atualização de movimentação
 */
const atualizarMovimentacaoValidation = [
  ...criarMovimentacaoValidation, // Reutilizar as mesmas validações

  body('id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido')
];

/**
 * Validações para movimentação via modal do fluxo
 */
const criarMovimentacaoFluxoValidation = [
  body('contaId')
    .notEmpty()
    .withMessage('Conta é obrigatória')
    .isInt({ min: 1 })
    .withMessage('ID da conta deve ser um número válido')
    .custom(async (contaId) => {
      const conta = getContaById(parseInt(contaId));
      if (!conta) {
        throw new Error('Conta não encontrada');
      }
      return true;
    }),

  body('mes')
    .notEmpty()
    .withMessage('Mês é obrigatório')
    .isInt({ min: 0, max: 11 })
    .withMessage('Mês deve ser entre 0 e 11'),

  body('ano')
    .notEmpty()
    .withMessage('Ano é obrigatório')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Ano deve ser entre 2000 e 2100')
    .custom((ano) => {
      const anoAtual = new Date().getFullYear();
      if (parseInt(ano) > anoAtual) {
        throw new Error('Ano não pode ser no futuro');
      }
      return true;
    }),

  body('valor')
    .notEmpty()
    .withMessage('Valor é obrigatório')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero')
    .custom((valor) => {
      const valorFloat = parseFloat(valor);
      if (valorFloat > 999999999.99) {
        throw new Error('Valor muito alto');
      }
      return true;
    })
    .toFloat(),

  body('anoRedirect')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Ano de redirecionamento inválido')
];

/**
 * Sanitização de dados comuns
 */
const sanitizeMovimentacao = [
  body('descricao').optional().trim().escape(),
  body('observacoes').optional().trim().escape()
];

module.exports = {
  criarMovimentacaoValidation,
  atualizarMovimentacaoValidation,
  criarMovimentacaoFluxoValidation,
  sanitizeMovimentacao
};