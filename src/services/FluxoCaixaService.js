const {
  ContaValor,
  getAllContaValores,
  getContaValorById,
  getContaValoresByPeriodo,
  getContaValoresByConta,
  addContaValor,
  updateContaValor,
  deleteContaValor,
  getResumoFinanceiro,
  calcularESalvarSaldosAnteriores,
  recalcularSaldosAno
} = require('../models/ContaValor');

const ContaService = require('./ContaService');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

class FluxoCaixaService {
  /**
   * Obter resumo financeiro
   */
  async getResumoFinanceiro() {
    try {
      return getResumoFinanceiro();
    } catch (error) {
      logger.error('Erro ao obter resumo financeiro', error);
      throw new AppError('Erro ao carregar resumo financeiro', 500);
    }
  }

  /**
   * Obter últimas movimentações
   */
  async getUltimasMovimentacoes(limit = 10) {
    try {
      const todasMovimentacoes = getAllContaValores();
      return todasMovimentacoes
        .sort((a, b) => b.data - a.data)
        .slice(0, limit);
    } catch (error) {
      logger.error('Erro ao obter últimas movimentações', error);
      throw new AppError('Erro ao carregar movimentações', 500);
    }
  }

  /**
   * Obter movimentações por período
   */
  async getMovimentacoesByPeriodo(dataInicio, dataFim) {
    try {
      if (!dataInicio || !dataFim) {
        throw new AppError('Datas de início e fim são obrigatórias', 400);
      }

      if (dataInicio > dataFim) {
        throw new AppError('Data de início deve ser anterior à data de fim', 400);
      }

      return getContaValoresByPeriodo(dataInicio, dataFim);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao obter movimentações por período', error);
      throw new AppError('Erro ao carregar movimentações do período', 500);
    }
  }

  /**
   * Obter movimentações com filtros
   */
  async getMovimentacoesComFiltros(filtros) {
    try {
      let movimentacoes = getAllContaValores();

      // Aplicar filtro de período
      if (filtros.dataInicio && filtros.dataFim) {
        movimentacoes = getContaValoresByPeriodo(filtros.dataInicio, filtros.dataFim);
      }

      // Aplicar filtro de conta
      if (filtros.contaId) {
        movimentacoes = movimentacoes.filter(m =>
          m.conta && m.conta.id === filtros.contaId
        );
      }

      // Aplicar filtro de tipo de conta
      if (filtros.tipoConta) {
        movimentacoes = movimentacoes.filter(m =>
          m.conta && m.conta.tipoConta === filtros.tipoConta
        );
      }

      return movimentacoes.sort((a, b) => b.data - a.data);
    } catch (error) {
      logger.error('Erro ao obter movimentações com filtros', error);
      throw new AppError('Erro ao filtrar movimentações', 500);
    }
  }

  /**
   * Obter movimentação por ID
   */
  async getMovimentacaoById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new AppError('ID da movimentação inválido', 400);
      }

      const movimentacao = getContaValorById(id);
      if (!movimentacao) {
        throw new AppError('Movimentação não encontrada', 404);
      }

      return movimentacao;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao obter movimentação por ID', error);
      throw new AppError('Erro ao carregar movimentação', 500);
    }
  }

  /**
   * Criar nova movimentação
   */
  async criarMovimentacao(dados) {
    try {
      this._validarDadosMovimentacao(dados);

      const conta = await ContaService.getContaById(dados.contaId);
      if (!conta) {
        throw new AppError('Conta não encontrada', 404);
      }

      // Verificar se é conta especial de saldo anterior
      if (ContaService.isContaSaldoAnterior(conta.id)) {
        throw new AppError('Não é possível adicionar movimentações na conta de Saldo Anterior', 400);
      }

      const novaMovimentacao = ContaValor.fromFormData(dados);
      const movimentacaoSalva = addContaValor(novaMovimentacao);

      logger.info(`Movimentação criada: ID ${movimentacaoSalva.id}`);
      return movimentacaoSalva;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao criar movimentação', error);
      throw new AppError('Erro ao criar movimentação', 500);
    }
  }

  /**
   * Atualizar movimentação
   */
  async atualizarMovimentacao(id, dados) {
    try {
      const movimentacaoExistente = await this.getMovimentacaoById(id);
      this._validarDadosMovimentacao(dados);

      const conta = await ContaService.getContaById(dados.contaId);
      if (!conta) {
        throw new AppError('Conta não encontrada', 404);
      }

      const movimentacaoAtualizada = ContaValor.fromFormData({
        ...dados,
        id
      });

      const resultado = updateContaValor(id, movimentacaoAtualizada);
      if (!resultado) {
        throw new AppError('Erro ao atualizar movimentação', 500);
      }

      logger.info(`Movimentação atualizada: ID ${id}`);
      return resultado;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao atualizar movimentação', error);
      throw new AppError('Erro ao atualizar movimentação', 500);
    }
  }

  /**
   * Deletar movimentação
   */
  async deletarMovimentacao(id) {
    try {
      const movimentacao = await this.getMovimentacaoById(id);

      const resultado = deleteContaValor(id);
      if (!resultado) {
        throw new AppError('Erro ao remover movimentação', 500);
      }

      logger.info(`Movimentação removida: ID ${id}`);
      return resultado;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao deletar movimentação', error);
      throw new AppError('Erro ao remover movimentação', 500);
    }
  }

  /**
   * Obter dados do fluxo anual
   */
  async getDadosFluxoAnual(anoSelecionado) {
    try {
      const anoAtual = new Date().getFullYear();

      // Calcular anos disponíveis
      const todasMovimentacoes = getAllContaValores();
      const anosDisponiveis = this._calcularAnosDisponiveis(todasMovimentacoes, anoAtual);

      // Calcular e salvar saldos anteriores
      calcularESalvarSaldosAnteriores(anoSelecionado);

      // Filtrar movimentações do ano
      const movimentacoesPorAno = todasMovimentacoes.filter(mov =>
        mov.data.getFullYear() === anoSelecionado
      );

      // Reorganizar contas e obter dados estruturados
      await ContaService.reorganizarContasPorCategoria();
      const todasContas = await ContaService.getContasOrdenadas();
      const todasCategorias = await ContaService.getAllCategorias();

      // Estruturar dados por conta e mês
      const dadosPorContaMes = this._estruturarDadosPorContaMes(
        todasContas,
        movimentacoesPorAno
      );

      const totaisPorMes = this._calcularTotaisPorMes(dadosPorContaMes);
      const totaisPorConta = this._calcularTotaisPorConta(dadosPorContaMes, anoSelecionado);
      const totalGeral = Object.values(totaisPorMes).reduce((acc, val) => acc + val, 0);

      // Importar funções helper do TipoConta
      const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');

      return {
        anoSelecionado,
        anosDisponiveis,
        dadosPorContaMes,
        totaisPorMes,
        totaisPorConta,
        totalGeral,
        todasCategorias,
        nomesMeses: this._getNomesMeses(),
        // Funções helper para templates EJS
        TipoConta,
        getTiposContaArray,
        getDescricaoTipoConta,
        getCorTipoConta,
        getIconeTipoConta
      };
    } catch (error) {
      logger.error('Erro ao obter dados do fluxo anual', error);
      throw new AppError('Erro ao carregar fluxo de caixa', 500);
    }
  }

  /**
   * Gerar relatório financeiro
   */
  async gerarRelatorio(dataInicio, dataFim) {
    try {
      const movimentacoesPeriodo = await this.getMovimentacoesByPeriodo(dataInicio, dataFim);
      const resumoGeral = await this.getResumoFinanceiro();

      // Calcular saldo do período
      const saldoPeriodo = movimentacoesPeriodo.reduce((acc, mov) =>
        acc + mov.getValorComSinal(), 0
      );

      // Agrupar por categoria
      const resumoPorCategoria = this._agruparPorCategoria(movimentacoesPeriodo);

      return {
        movimentacoesPeriodo,
        saldoPeriodo,
        resumoGeral,
        resumoPorCategoria
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório', error);
      throw new AppError('Erro ao gerar relatório', 500);
    }
  }

  /**
   * Validar dados da movimentação
   * @private
   */
  _validarDadosMovimentacao(dados) {
    const erros = [];

    if (!dados.contaId || dados.contaId === '') {
      erros.push('Conta é obrigatória');
    }

    if (!dados.data || dados.data === '') {
      erros.push('Data é obrigatória');
    }

    if (!dados.valor || isNaN(parseFloat(dados.valor)) || parseFloat(dados.valor) === 0) {
      erros.push('Valor deve ser um número diferente de zero');
    }

    if (erros.length > 0) {
      throw new AppError(erros.join(', '), 400);
    }
  }

  /**
   * Calcular anos disponíveis
   * @private
   */
  _calcularAnosDisponiveis(movimentacoes, anoAtual) {
    let anosDisponiveis = [];

    if (movimentacoes.length > 0) {
      const anosComDados = movimentacoes.map(mov => mov.data.getFullYear());
      const primeiroAno = Math.min(...anosComDados);

      for (let ano = primeiroAno; ano <= anoAtual; ano++) {
        anosDisponiveis.push(ano);
      }

      anosDisponiveis.sort((a, b) => b - a);
    } else {
      anosDisponiveis.push(anoAtual);
    }

    return anosDisponiveis;
  }

  /**
   * Estruturar dados por conta e mês
   * @private
   */
  _estruturarDadosPorContaMes(todasContas, movimentacoesPorAno) {
    const dadosPorContaMes = {};

    // Inicializar estrutura para todas as contas
    todasContas.forEach(conta => {
      dadosPorContaMes[conta.ordemTabela] = {
        conta: conta,
        meses: {}
      };

      // Inicializar todos os meses com 0
      for (let mes = 0; mes < 12; mes++) {
        dadosPorContaMes[conta.ordemTabela].meses[mes] = 0;
      }
    });

    // Agrupar valores por conta e mês
    movimentacoesPorAno.forEach(mov => {
      const contaId = mov.conta.ordemTabela;
      const mes = mov.data.getMonth();

      if (dadosPorContaMes[contaId]) {
        dadosPorContaMes[contaId].meses[mes] += mov.getValorComSinal();
      }
    });

    return dadosPorContaMes;
  }

  /**
   * Calcular totais por mês
   * @private
   */
  _calcularTotaisPorMes(dadosPorContaMes) {
    const totaisPorMes = {};

    for (let mes = 0; mes < 12; mes++) {
      totaisPorMes[mes] = 0;
      Object.values(dadosPorContaMes).forEach(item => {
        totaisPorMes[mes] += item.meses[mes];
      });
    }

    return totaisPorMes;
  }

  /**
   * Calcular totais por conta
   * @private
   */
  _calcularTotaisPorConta(dadosPorContaMes, anoSelecionado) {
    const totaisPorConta = {};

    Object.keys(dadosPorContaMes).forEach(contaId => {
      const conta = dadosPorContaMes[contaId].conta;

      // Excluir contas do tipo SALDO do cálculo de média
      if (conta.tipoConta === 'SALDO') {
        totaisPorConta[contaId] = 0;
        return;
      }

      let soma = 0;
      let mesesComValor = 0;

      Object.values(dadosPorContaMes[contaId].meses).forEach(valor => {
        if (valor !== 0) {
          soma += valor;
          mesesComValor++;
        }
      });

      totaisPorConta[contaId] = mesesComValor > 0 ? soma / mesesComValor : 0;
    });

    return totaisPorConta;
  }

  /**
   * Agrupar movimentações por categoria
   * @private
   */
  _agruparPorCategoria(movimentacoesPeriodo) {
    const resumoPorCategoria = {};

    movimentacoesPeriodo.forEach(mov => {
      const categoria = mov.conta.categoriaConta.categoria;

      if (!resumoPorCategoria[categoria]) {
        resumoPorCategoria[categoria] = { receitas: 0, despesas: 0, total: 0 };
      }

      if (mov.isReceita()) {
        resumoPorCategoria[categoria].receitas += mov.valor;
      } else if (mov.isDespesa()) {
        resumoPorCategoria[categoria].despesas += mov.valor;
      }

      resumoPorCategoria[categoria].total =
        resumoPorCategoria[categoria].receitas - resumoPorCategoria[categoria].despesas;
    });

    return resumoPorCategoria;
  }

  /**
   * Obter nomes dos meses
   * @private
   */
  _getNomesMeses() {
    return [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
  }
}

module.exports = new FluxoCaixaService();