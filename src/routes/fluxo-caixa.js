import express from 'express';

const router = express.Router();

// Controllers
import FluxoCaixaController from '../controllers/FluxoCaixaController.js';

// Validations
import {
  criarMovimentacaoValidation,
  atualizarMovimentacaoValidation,
  criarMovimentacaoFluxoValidation,
  sanitizeMovimentacao
} from '../validations/movimentacaoValidation.js';

import {
  criarContaFluxoValidation,
  atualizarOrdemContasValidation
} from '../validations/contaValidation.js';

// Middleware
import { formLimiter } from '../middleware/security.js';
import { catchAsync } from '../utils/errorHandler.js';

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * GET / - Dashboard do Fluxo de Caixa
 */
router.get('/', catchAsync(FluxoCaixaController.getDashboard));

// ============================================================================
// MOVIMENTAÇÕES
// ============================================================================

/**
 * GET /movimentacoes - Listar movimentações
 */
router.get('/movimentacoes', catchAsync(FluxoCaixaController.getMovimentacoes));

/**
 * GET /movimentacoes/add - Formulário para nova movimentação
 */
router.get('/movimentacoes/add', catchAsync(FluxoCaixaController.getNovaMovimentacao));

/**
 * POST /movimentacoes/add - Criar nova movimentação
 */
router.post('/movimentacoes/add',
  formLimiter,
  criarMovimentacaoValidation,
  sanitizeMovimentacao,
  catchAsync(FluxoCaixaController.postNovaMovimentacao)
);

/**
 * GET /movimentacoes/:id/edit - Formulário para editar movimentação
 */
router.get('/movimentacoes/:id/edit', catchAsync(FluxoCaixaController.getEditarMovimentacao));

/**
 * POST /movimentacoes/:id/edit - Atualizar movimentação
 */
router.post('/movimentacoes/:id/edit',
  formLimiter,
  atualizarMovimentacaoValidation,
  sanitizeMovimentacao,
  catchAsync(FluxoCaixaController.postEditarMovimentacao)
);

/**
 * POST /movimentacoes/:id/delete - Deletar movimentação
 */
router.post('/movimentacoes/:id/delete',
  formLimiter,
  catchAsync(FluxoCaixaController.deletarMovimentacao)
);

// ============================================================================
// CONTAS (Básico - para integração com páginas existentes)
// ============================================================================

/**
 * GET /contas - Listar contas (redirecionar para controller dedicado se existir)
 */
router.get('/contas', (req, res) => {
  res.redirect('/contas'); // Assumindo que existe rota dedicada para contas
});

// ============================================================================
// FLUXO PRINCIPAL
// ============================================================================

/**
 * GET /fluxo - Página principal do fluxo de caixa
 */
router.get('/fluxo', catchAsync(FluxoCaixaController.getFluxo));

/**
 * POST /fluxo/conta/add - Criar nova conta via modal do fluxo
 */
router.post('/fluxo/conta/add',
  formLimiter,
  criarContaFluxoValidation,
  catchAsync(async (req, res, next) => {
    try {
      // Importar lógica do arquivo original mantendo compatibilidade
      const { validationResult } = await import('express-validator');
      const ContaService = (await import('../services/ContaService.js')).default;
      const {
        CategoriaConta,
        addCategoria,
        categoriaExists
      } = await import('../models/CategoriaConta.js');
      const { Conta, addConta, contaExists } = await import('../models/Conta.js');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(e => e.msg).join(', '));
        const ano = req.body.ano || new Date().getFullYear();
        return res.redirect(`/fluxo-caixa/fluxo?ano=${ano}`);
      }

      const { nomeConta, tipoConta, categoriaId, novaCategoriaNome } = req.body;
      const ano = req.body.ano || new Date().getFullYear();
      let categoriaSelecionadaId = categoriaId;

      // Lógica para categoria (existente ou nova)
      if (categoriaId === 'nova') {
        if (!novaCategoriaNome || novaCategoriaNome.trim() === '') {
          req.flash('error', 'Nome da nova categoria é obrigatório');
          return res.redirect(`/fluxo-caixa/fluxo?ano=${ano}`);
        }

        if (categoriaExists(novaCategoriaNome.trim())) {
          req.flash('error', 'Já existe uma categoria com este nome');
          return res.redirect(`/fluxo-caixa/fluxo?ano=${ano}`);
        }

        const novaCategoria = new CategoriaConta(null, novaCategoriaNome.trim());
        const categoriaAdicionada = addCategoria(novaCategoria);
        categoriaSelecionadaId = categoriaAdicionada.id;
      }

      // Criar nova conta
      const dadosFormulario = { ...req.body, categoriaId: categoriaSelecionadaId };
      const novaConta = Conta.fromFormData(dadosFormulario);
      addConta(novaConta);

      let mensagem = 'Conta adicionada com sucesso!';
      if (categoriaId === 'nova') {
        mensagem = `Conta e categoria "${novaCategoriaNome.trim()}" adicionadas com sucesso!`;
      }

      req.flash('success', mensagem);
      res.redirect(`/fluxo-caixa/fluxo?ano=${ano}`);
    } catch (error) {
      req.flash('error', 'Erro interno do servidor');
      const ano = req.body.ano || new Date().getFullYear();
      res.redirect(`/fluxo-caixa/fluxo?ano=${ano}`);
    }
  })
);

/**
 * POST /fluxo/movimentacao/add - Criar nova movimentação via modal do fluxo
 */
router.post('/fluxo/movimentacao/add',
  formLimiter,
  criarMovimentacaoFluxoValidation,
  catchAsync(async (req, res, next) => {
    try {
      // Importar lógica do arquivo original mantendo compatibilidade
      const { validationResult } = await import('express-validator');
      const { ContaValor, addContaValor, recalcularSaldosAno } = await import('../models/ContaValor.js');
      const { getContaById, isContaSaldoAnterior } = await import('../models/Conta.js');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(e => e.msg).join(', '));
        const anoRedirect = req.body.anoRedirect || new Date().getFullYear();
        return res.redirect(`/fluxo-caixa/fluxo?ano=${anoRedirect}`);
      }

      const { contaId, mes, ano, valor } = req.body;
      const anoRedirect = req.body.anoRedirect || new Date().getFullYear();

      // Criar data baseada no mês e ano
      const dataMovimentacao = new Date(parseInt(ano), parseInt(mes), 15); // Dia 15 do mês
      const conta = getContaById(contaId);

      // Criar nova movimentação
      const novaMovimentacao = new ContaValor(
        null, // ID será atribuído automaticamente
        dataMovimentacao,
        parseFloat(valor),
        conta
      );

      addContaValor(novaMovimentacao);

      // Recalcular saldos para o ano da movimentação
      recalcularSaldosAno(parseInt(ano));

      req.flash('success', `Movimentação adicionada com sucesso para ${conta.nomeConta}!`);
      res.redirect(`/fluxo-caixa/fluxo?ano=${anoRedirect}`);
    } catch (error) {
      req.flash('error', 'Erro interno do servidor');
      const anoRedirect = req.body.anoRedirect || new Date().getFullYear();
      res.redirect(`/fluxo-caixa/fluxo?ano=${anoRedirect}`);
    }
  })
);

/**
 * POST /fluxo/contas/ordem - Salvar nova ordem das contas
 */
router.post('/fluxo/contas/ordem',
  formLimiter,
  atualizarOrdemContasValidation,
  catchAsync(async (req, res, next) => {
    try {
      const { atualizarOrdemContas } = await import('../models/Conta.js');
      const { novaOrdem } = req.body;

      const sucesso = atualizarOrdemContas(novaOrdem);

      if (sucesso) {
        res.json({
          success: true,
          message: 'Ordem das contas atualizada com sucesso'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao atualizar ordem das contas'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  })
);

// ============================================================================
// RELATÓRIOS
// ============================================================================

/**
 * GET /relatorios - Relatórios financeiros
 */
router.get('/relatorios', catchAsync(FluxoCaixaController.getRelatorios));

// ============================================================================
// API / DEBUG ENDPOINTS
// ============================================================================

/**
 * GET /debug/contas/ordem - Debug: Ver ordem das contas
 */
router.get('/debug/contas/ordem', catchAsync(async (req, res) => {
  try {
    const ContaService = (await import('../services/ContaService.js')).default;
    const contasOrdenadas = await ContaService.getContasOrdenadas();

    const debug = contasOrdenadas.map(conta => ({
      id: conta.id,
      nome: conta.nomeConta,
      categoria: conta.categoriaConta?.categoria,
      ordemTabela: conta.ordemTabela
    }));

    res.json({
      success: true,
      contas: debug,
      total: debug.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

export default router;
