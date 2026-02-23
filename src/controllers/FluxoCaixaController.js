const FluxoCaixaService = require('../services/FluxoCaixaService');
const ContaService = require('../services/ContaService');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

class FluxoCaixaController {
  /**
   * Dashboard principal do fluxo de caixa
   */
  async getDashboard(req, res, next) {
    try {
      const resumo = await FluxoCaixaService.getResumoFinanceiro();
      const ultimasMovimentacoes = await FluxoCaixaService.getUltimasMovimentacoes(10);

      // Dados para gráficos (últimos 30 dias)
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 30);
      const dataFim = new Date();

      const movimentacoesPeriodo = await FluxoCaixaService.getMovimentacoesByPeriodo(dataInicio, dataFim);

      // Importar funções helper
      const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

      res.render('fluxo-caixa/dashboard', {
        title: 'Fluxo de Caixa - Dashboard',
        resumo,
        ultimasMovimentacoes,
        movimentacoesPeriodo,
        TipoConta,
        getTiposContaArray,
        getDescricaoTipoConta,
        getCorTipoConta,
        getIconeTipoConta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar movimentações com filtros
   */
  async getMovimentacoes(req, res, next) {
    try {
      const { dataInicio, dataFim, contaId, tipoConta } = req.query;

      const filtros = {
        dataInicio: dataInicio ? new Date(dataInicio) : null,
        dataFim: dataFim ? new Date(dataFim) : null,
        contaId: contaId ? parseInt(contaId) : null,
        tipoConta
      };

      const movimentacoes = await FluxoCaixaService.getMovimentacoesComFiltros(filtros);
      const contas = await ContaService.getAllContas();
      const tipos = ContaService.getTiposContaArray();

      // Importar funções helper
      const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

      res.render('fluxo-caixa/movimentacoes', {
        title: 'Movimentações',
        movimentacoes,
        contas,
        tipos,
        filtros: { dataInicio, dataFim, contaId, tipoConta },
        TipoConta,
        getTiposContaArray,
        getDescricaoTipoConta,
        getCorTipoConta,
        getIconeTipoConta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Formulário para nova movimentação
   */
  async getNovaMovimentacao(req, res, next) {
    try {
      const contas = await ContaService.getAllContas();

      // Importar funções helper
      const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

      res.render('fluxo-caixa/movimentacao-form', {
        title: 'Nova Movimentação',
        contas,
        movimentacao: null,
        errors: null,
        TipoConta,
        getTiposContaArray,
        getDescricaoTipoConta,
        getCorTipoConta,
        getIconeTipoConta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar nova movimentação
   */
  async postNovaMovimentacao(req, res, next) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const contas = await ContaService.getAllContas();

        // Importar funções helper
        const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

        return res.render('fluxo-caixa/movimentacao-form', {
          title: 'Nova Movimentação',
          contas,
          movimentacao: null,
          errors: errors.array(),
          formData: req.body,
          TipoConta,
          getTiposContaArray,
          getDescricaoTipoConta,
          getCorTipoConta,
          getIconeTipoConta
        });
      }

      await FluxoCaixaService.criarMovimentacao(req.body);

      req.flash('success', 'Movimentação adicionada com sucesso!');
      res.redirect('/fluxo-caixa/movimentacoes');
    } catch (error) {
      if (error instanceof AppError) {
        const contas = await ContaService.getAllContas();

        // Importar funções helper
        const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

        return res.render('fluxo-caixa/movimentacao-form', {
          title: 'Nova Movimentação',
          contas,
          movimentacao: null,
          errors: [{ msg: error.message }],
          formData: req.body,
          TipoConta,
          getTiposContaArray,
          getDescricaoTipoConta,
          getCorTipoConta,
          getIconeTipoConta
        });
      }
      next(error);
    }
  }

  /**
   * Formulário para editar movimentação
   */
  async getEditarMovimentacao(req, res, next) {
    try {
      const movimentacaoId = parseInt(req.params.id);
      const movimentacao = await FluxoCaixaService.getMovimentacaoById(movimentacaoId);

      if (!movimentacao) {
        throw new AppError('Movimentação não encontrada', 404);
      }

      const contas = await ContaService.getAllContas();

      // Importar funções helper
      const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

      res.render('fluxo-caixa/movimentacao-form', {
        title: 'Editar Movimentação',
        contas,
        movimentacao,
        errors: null,
        TipoConta,
        getTiposContaArray,
        getDescricaoTipoConta,
        getCorTipoConta,
        getIconeTipoConta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar movimentação
   */
  async postEditarMovimentacao(req, res, next) {
    try {
      const movimentacaoId = parseInt(req.params.id);

      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const contas = await ContaService.getAllContas();
        const movimentacao = await FluxoCaixaService.getMovimentacaoById(movimentacaoId);

        // Importar funções helper
        const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

        return res.render('fluxo-caixa/movimentacao-form', {
          title: 'Editar Movimentação',
          contas,
          movimentacao,
          errors: errors.array(),
          TipoConta,
          getTiposContaArray,
          getDescricaoTipoConta,
          getCorTipoConta,
          getIconeTipoConta
        });
      }

      await FluxoCaixaService.atualizarMovimentacao(movimentacaoId, req.body);

      req.flash('success', 'Movimentação atualizada com sucesso!');
      res.redirect('/fluxo-caixa/movimentacoes');
    } catch (error) {
      if (error instanceof AppError) {
        req.flash('error', error.message);
        return res.redirect('/fluxo-caixa/movimentacoes');
      }
      next(error);
    }
  }

  /**
   * Deletar movimentação
   */
  async deletarMovimentacao(req, res, next) {
    try {
      const movimentacaoId = parseInt(req.params.id);
      await FluxoCaixaService.deletarMovimentacao(movimentacaoId);

      req.flash('success', 'Movimentação removida com sucesso!');
      res.redirect('/fluxo-caixa/movimentacoes');
    } catch (error) {
      if (error instanceof AppError) {
        req.flash('error', error.message);
        return res.redirect('/fluxo-caixa/movimentacoes');
      }
      next(error);
    }
  }

  /**
   * Página principal do fluxo
   */
  async getFluxo(req, res, next) {
    try {
      const anoAtual = new Date().getFullYear();
      const anoSelecionado = parseInt(req.query.ano) || anoAtual;

      const dados = await FluxoCaixaService.getDadosFluxoAnual(anoSelecionado);

      res.render('fluxo-caixa/fluxo', {
        title: `Fluxo de Caixa - ${anoSelecionado}`,
        ...dados
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Relatórios financeiros
   */
  async getRelatorios(req, res, next) {
    try {
      // Período padrão: último mês
      const dataFimDefault = new Date();
      const dataInicioDefault = new Date();
      dataInicioDefault.setMonth(dataInicioDefault.getMonth() - 1);

      const { dataInicio, dataFim } = req.query;

      const dataInicioQuery = dataInicio ? new Date(dataInicio) : dataInicioDefault;
      const dataFimQuery = dataFim ? new Date(dataFim) : dataFimDefault;

      const relatorio = await FluxoCaixaService.gerarRelatorio(dataInicioQuery, dataFimQuery);

      // Importar funções helper
      const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

      res.render('fluxo-caixa/relatorios', {
        title: 'Relatórios Financeiros',
        ...relatorio,
        filtros: {
          dataInicio: dataInicioQuery.toISOString().split('T')[0],
          dataFim: dataFimQuery.toISOString().split('T')[0]
        },
        TipoConta,
        getTiposContaArray,
        getDescricaoTipoConta,
        getCorTipoConta,
        getIconeTipoConta
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FluxoCaixaController();