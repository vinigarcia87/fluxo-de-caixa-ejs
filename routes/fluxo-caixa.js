var express = require('express');
var router = express.Router();

// Helper functions para mensagens de sessão
function setSuccessMessage(req, message) {
  req.session.message = message;
}

function setErrorMessage(req, message) {
  req.session.error = message;
}

// Importar os modelos
const { TipoConta, getTiposContaArray, getDescricaoTipoConta, getCorTipoConta, getIconeTipoConta } = require('../models/TipoConta');
const { CategoriaConta, getAllCategorias, getCategoriaById, addCategoria, updateCategoria, deleteCategoria, categoriaExists } = require('../models/CategoriaConta');
const { Conta, getAllContas, getContaById, getContasByTipo, addConta, updateConta, deleteConta, contaExists, getContasEditaveis, getContasParaModal, getContasOrdenadas, atualizarOrdemContas, reorganizarContasPorCategoria, definirOrdemPorCategoria, isContaSaldoAnterior, CONTA_SALDO_ANTERIOR_ID } = require('../models/Conta');
const {
  ContaValor,
  getAllContaValores,
  getContaValorById,
  getContaValoresByPeriodo,
  getContaValoresByConta,
  getContaValoresByTipo,
  addContaValor,
  updateContaValor,
  deleteContaValor,
  calcularSaldoAtual,
  calcularTotalPorTipo,
  calcularSaldoPorPeriodo,
  getResumoFinanceiro,
  calcularESalvarSaldosAnteriores,
  recalcularSaldosAno
} = require('../models/ContaValor');

/* GET - Dashboard do Fluxo de Caixa */
router.get('/', function(req, res, next) {
  try {
    const resumo = getResumoFinanceiro();
    const ultimasMovimentacoes = getAllContaValores().slice(0, 10); // Últimas 10

    // Dados para gráficos (últimos 30 dias)
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);
    const dataFim = new Date();

    const movimentacoesPeriodo = getContaValoresByPeriodo(dataInicio, dataFim);

    res.render('fluxo-caixa/dashboard', {
      title: 'Fluxo de Caixa - Dashboard',
      resumo: resumo,
      ultimasMovimentacoes: ultimasMovimentacoes,
      movimentacoesPeriodo: movimentacoesPeriodo,
      TipoConta: TipoConta,
      getDescricaoTipoConta: getDescricaoTipoConta,
      getCorTipoConta: getCorTipoConta,
      getIconeTipoConta: getIconeTipoConta,
      // Mensagens são passadas automaticamente via middleware de sessão
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).render('error', {
      message: 'Erro ao carregar dashboard',
      error: { status: 500 }
    });
  }
});

/* GET - Listar todas as movimentações */
router.get('/movimentacoes', function(req, res, next) {
  try {
    let movimentacoes = getAllContaValores();

    // Filtros
    const { dataInicio, dataFim, contaId, tipoConta } = req.query;

    if (dataInicio && dataFim) {
      movimentacoes = getContaValoresByPeriodo(dataInicio, dataFim);
    }

    if (contaId) {
      movimentacoes = movimentacoes.filter(m => m.conta && m.conta.id === parseInt(contaId));
    }

    if (tipoConta) {
      movimentacoes = movimentacoes.filter(m => m.conta && m.conta.tipoConta === tipoConta);
    }

    const contas = getAllContas();
    const tipos = getTiposContaArray();

    res.render('fluxo-caixa/movimentacoes', {
      title: 'Movimentações',
      movimentacoes: movimentacoes,
      contas: contas,
      tipos: tipos,
      filtros: { dataInicio, dataFim, contaId, tipoConta },
      TipoConta: TipoConta,
      getDescricaoTipoConta: getDescricaoTipoConta,
      getCorTipoConta: getCorTipoConta,
      getIconeTipoConta: getIconeTipoConta,
      // Mensagens são passadas automaticamente via middleware de sessão
    });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).render('error', {
      message: 'Erro ao carregar movimentações',
      error: { status: 500 }
    });
  }
});

/* GET - Formulário para nova movimentação */
router.get('/movimentacoes/add', function(req, res, next) {
  try {
    const contas = getAllContas();

    res.render('fluxo-caixa/movimentacao-form', {
      title: 'Nova Movimentação',
      contas: contas,
      movimentacao: null,
      errors: null,
      TipoConta: TipoConta,
      getDescricaoTipoConta: getDescricaoTipoConta,
      getCorTipoConta: getCorTipoConta,
      getIconeTipoConta: getIconeTipoConta
    });
  } catch (error) {
    console.error('Erro ao carregar formulário:', error);
    res.status(500).render('error', {
      message: 'Erro ao carregar formulário',
      error: { status: 500 }
    });
  }
});

/* POST - Criar nova movimentação */
router.post('/movimentacoes/add', function(req, res, next) {
  try {
    const errors = [];
    const { contaId, data, valor } = req.body;

    // Validações
    if (!contaId || contaId === '') errors.push('Conta é obrigatória');
    if (!data || data === '') errors.push('Data é obrigatória');
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) === 0) {
      errors.push('Valor deve ser um número diferente de zero');
    }

    const conta = getContaById(contaId);
    if (!conta) errors.push('Conta selecionada não encontrada');

    if (errors.length > 0) {
      const contas = getAllContas();
      return res.render('fluxo-caixa/movimentacao-form', {
        title: 'Nova Movimentação',
        contas: contas,
        movimentacao: null,
        errors: errors,
        formData: req.body,
        TipoConta: TipoConta,
        getDescricaoTipoConta: getDescricaoTipoConta,
        getCorTipoConta: getCorTipoConta,
        getIconeTipoConta: getIconeTipoConta
      });
    }

    // Criar nova movimentação
    const novaMovimentacao = ContaValor.fromFormData(req.body);
    addContaValor(novaMovimentacao);

    setSuccessMessage(req, 'Movimentação adicionada com sucesso!');
    res.redirect('/fluxo-caixa/movimentacoes');
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    const contas = getAllContas();
    res.render('fluxo-caixa/movimentacao-form', {
      title: 'Nova Movimentação',
      contas: contas,
      movimentacao: null,
      errors: ['Erro interno do servidor. Tente novamente.'],
      formData: req.body,
      TipoConta: TipoConta,
      getDescricaoTipoConta: getDescricaoTipoConta,
      getCorTipoConta: getCorTipoConta,
      getIconeTipoConta: getIconeTipoConta
    });
  }
});

/* GET - Formulário para editar movimentação */
router.get('/movimentacoes/:id/edit', function(req, res, next) {
  try {
    const movimentacaoId = parseInt(req.params.id);
    const movimentacao = getContaValorById(movimentacaoId);

    if (!movimentacao) {
      return res.status(404).render('error', {
        message: 'Movimentação não encontrada',
        error: { status: 404 }
      });
    }

    const contas = getAllContas();

    res.render('fluxo-caixa/movimentacao-form', {
      title: 'Editar Movimentação',
      contas: contas,
      movimentacao: movimentacao,
      errors: null,
      TipoConta: TipoConta,
      getDescricaoTipoConta: getDescricaoTipoConta,
      getCorTipoConta: getCorTipoConta,
      getIconeTipoConta: getIconeTipoConta
    });
  } catch (error) {
    console.error('Erro ao carregar movimentação para edição:', error);
    res.status(500).render('error', {
      message: 'Erro ao carregar movimentação',
      error: { status: 500 }
    });
  }
});

/* POST - Atualizar movimentação */
router.post('/movimentacoes/:id/edit', function(req, res, next) {
  try {
    const movimentacaoId = parseInt(req.params.id);
    const movimentacaoExistente = getContaValorById(movimentacaoId);

    if (!movimentacaoExistente) {
      return res.status(404).render('error', {
        message: 'Movimentação não encontrada',
        error: { status: 404 }
      });
    }

    const errors = [];
    const { contaId, data, valor } = req.body;

    // Validações
    if (!contaId || contaId === '') errors.push('Conta é obrigatória');
    if (!data || data === '') errors.push('Data é obrigatória');
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) === 0) {
      errors.push('Valor deve ser um número diferente de zero');
    }

    const conta = getContaById(contaId);
    if (!conta) errors.push('Conta selecionada não encontrada');

    if (errors.length > 0) {
      const contas = getAllContas();
      return res.render('fluxo-caixa/movimentacao-form', {
        title: 'Editar Movimentação',
        contas: contas,
        movimentacao: movimentacaoExistente,
        errors: errors,
        TipoConta: TipoConta,
        getDescricaoTipoConta: getDescricaoTipoConta,
        getCorTipoConta: getCorTipoConta,
        getIconeTipoConta: getIconeTipoConta
      });
    }

    // Atualizar movimentação
    const movimentacaoAtualizada = ContaValor.fromFormData({
      ...req.body,
      id: movimentacaoId
    });

    updateContaValor(movimentacaoId, movimentacaoAtualizada);

    setSuccessMessage(req, 'Movimentação atualizada com sucesso!');
    res.redirect('/fluxo-caixa/movimentacoes');
  } catch (error) {
    console.error('Erro ao atualizar movimentação:', error);
    res.status(500).render('error', {
      message: 'Erro ao atualizar movimentação',
      error: { status: 500 }
    });
  }
});

/* POST - Remover movimentação */
router.post('/movimentacoes/:id/delete', function(req, res, next) {
  try {
    const movimentacaoId = parseInt(req.params.id);
    const movimentacao = deleteContaValor(movimentacaoId);

    if (!movimentacao) {
      setErrorMessage(req, 'Movimentação não encontrada!');
      return res.redirect('/fluxo-caixa/movimentacoes');
    }

    setSuccessMessage(req, 'Movimentação removida com sucesso!');
    res.redirect('/fluxo-caixa/movimentacoes');
  } catch (error) {
    console.error('Erro ao remover movimentação:', error);
    setErrorMessage(req, 'Erro ao remover movimentação!');
    res.redirect('/fluxo-caixa/movimentacoes');
  }
});

/* GET - Listar contas */
router.get('/contas', function(req, res, next) {
  try {
    const contas = getAllContas();
    const contasEditaveis = getContasEditaveis();
    const categorias = getAllCategorias();

    res.render('fluxo-caixa/contas', {
      title: 'Gerenciar Contas',
      contas: contas,
      contasEditaveis: contasEditaveis,
      categorias: categorias,
      TipoConta: TipoConta,
      getTiposContaArray: getTiposContaArray,
      getDescricaoTipoConta: getDescricaoTipoConta,
      getCorTipoConta: getCorTipoConta,
      getIconeTipoConta: getIconeTipoConta,
      // Mensagens são passadas automaticamente via middleware de sessão
    });
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).render('error', {
      message: 'Erro ao carregar contas',
      error: { status: 500 }
    });
  }
});

/* POST - Criar nova conta */
router.post('/contas/add', function(req, res, next) {
  try {
    const errors = [];
    const { nomeConta, tipoConta, categoriaId } = req.body;

    // Validações
    if (!nomeConta || nomeConta.trim() === '') errors.push('Nome da conta é obrigatório');
    if (!tipoConta || !getTiposContaArray().includes(tipoConta)) errors.push('Tipo de conta inválido');
    if (!categoriaId) errors.push('Categoria é obrigatória');

    // Verifica se conta já existe
    if (nomeConta && contaExists(nomeConta.trim())) {
      errors.push('Já existe uma conta com este nome');
    }

    const categoria = getCategoriaById(categoriaId);
    if (!categoria) errors.push('Categoria selecionada não encontrada');

    if (errors.length > 0) {
      // Reenviar dados para exibir erros
      setErrorMessage(req, 'Erro: ' + errors.join(', '));
      return res.redirect('/fluxo-caixa/contas');
    }

    // Criar nova conta
    const novaConta = Conta.fromFormData(req.body);
    addConta(novaConta);

    setSuccessMessage(req, 'Conta adicionada com sucesso!');
    res.redirect('/fluxo-caixa/contas');
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    setErrorMessage(req, 'Erro interno do servidor');
    res.redirect('/fluxo-caixa/contas');
  }
});

/* POST - Remover conta */
router.post('/contas/:id/delete', function(req, res, next) {
  try {
    const contaId = parseInt(req.params.id);

    // Impedir exclusão da conta especial
    if (isContaSaldoAnterior(contaId)) {
      setErrorMessage(req, 'Não é possível remover a conta especial de Saldo Anterior');
      return res.redirect('/fluxo-caixa/contas');
    }

    // Verificar se existem movimentações para esta conta
    const movimentacoes = getContaValoresByConta(contaId);
    if (movimentacoes.length > 0) {
      setErrorMessage(req, 'Não é possível remover conta com movimentações');
      return res.redirect('/fluxo-caixa/contas');
    }

    const conta = deleteConta(contaId);

    if (!conta) {
      setErrorMessage(req, 'Conta não encontrada');
      return res.redirect('/fluxo-caixa/contas');
    }

    setSuccessMessage(req, 'Conta removida com sucesso!');
    res.redirect('/fluxo-caixa/contas');
  } catch (error) {
    console.error('Erro ao remover conta:', error);
    setErrorMessage(req, 'Erro ao remover conta');
    res.redirect('/fluxo-caixa/contas');
  }
});

/* GET - Tela Principal do Fluxo de Caixa */
router.get('/fluxo', function(req, res, next) {
  try {
    // Ano selecionado (padrão: ano atual)
    const anoAtual = new Date().getFullYear();
    const anoSelecionado = parseInt(req.query.ano) || anoAtual;

    // Obter todos os anos disponíveis para o seletor
    // REGRA: Exibir todos os anos desde o primeiro registro até o ano atual
    const todasMovimentacoes = getAllContaValores();

    let anosDisponiveis = [];

    if (todasMovimentacoes.length > 0) {
      // Encontrar o primeiro ano com dados registrados
      const anosComDados = todasMovimentacoes.map(mov => mov.data.getFullYear());
      const primeiroAno = Math.min(...anosComDados);

      // Criar lista completa: do primeiro ano até o ano atual (inclusive)
      // Isso garante que anos sem movimentações também apareçam no seletor
      for (let ano = primeiroAno; ano <= anoAtual; ano++) {
        anosDisponiveis.push(ano);
      }

      // Ordenar decrescente (mais recente primeiro)
      // O ano atual será sempre o primeiro da lista
      anosDisponiveis.sort((a, b) => b - a);
    } else {
      // Se não há nenhum dado, incluir apenas o ano atual
      anosDisponiveis.push(anoAtual);
    }

    // Calcular e salvar saldos anteriores para o ano selecionado
    calcularESalvarSaldosAnteriores(anoSelecionado);

    // Filtrar movimentações do ano selecionado
    const movimentacoesPorAno = todasMovimentacoes.filter(mov =>
      mov.data.getFullYear() === anoSelecionado
    );

    // Forçar reorganização das contas por categoria e obter ordenadas
    reorganizarContasPorCategoria();
    const todasContas = getContasOrdenadas();
    const todasCategorias = getAllCategorias();

    // Criar estrutura de dados: conta -> mês -> valor
    const dadosPorContaMes = {};

    // SEMPRE inicializar estrutura para TODAS as contas cadastradas
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

    // Agrupar valores por conta e mês (apenas para contas que têm movimentações)
    movimentacoesPorAno.forEach(mov => {
      const contaId = mov.conta.ordemTabela;
      const mes = mov.data.getMonth(); // 0-11

      // Como sempre inicializamos todas as contas, esta verificação sempre será verdadeira
      if (dadosPorContaMes[contaId]) {
        dadosPorContaMes[contaId].meses[mes] += mov.getValorComSinal();
      }
    });

    // Calcular totais por mês
    const totaisPorMes = {};
    for (let mes = 0; mes < 12; mes++) {
      totaisPorMes[mes] = 0;
      Object.values(dadosPorContaMes).forEach(item => {
        totaisPorMes[mes] += item.meses[mes];
      });
    }

    // Calcular médias mensais por conta APENAS DO ANO SELECIONADO (excluindo contas do tipo SALDO)
    // REGRA:
    // - Considera apenas movimentações do ano em exibição (${anoSelecionado})
    // - Contas SALDO não têm média calculada pois representam saldo anterior
    // - Média = soma dos valores ÷ quantidade de meses com movimentação no ano
    const totaisPorConta = {};
    Object.keys(dadosPorContaMes).forEach(contaId => {
      const conta = dadosPorContaMes[contaId].conta;

      // Excluir contas do tipo SALDO do cálculo de média
      if (conta.tipoConta === 'SALDO') {
        totaisPorConta[contaId] = 0; // Não exibir valor para contas de saldo
        return;
      }

      // Calcular soma dos valores da conta NO ANO SELECIONADO
      // dadosPorContaMes já contém apenas dados do ano selecionado devido ao filtro anterior
      let soma = 0;
      let mesesComValor = 0;

      Object.values(dadosPorContaMes[contaId].meses).forEach(valor => {
        if (valor !== 0) {
          soma += valor;
          mesesComValor++;
        }
      });

      // Calcular média (soma / meses com movimentação no ano selecionado)
      if (mesesComValor > 0) {
        totaisPorConta[contaId] = soma / mesesComValor;
      } else {
        totaisPorConta[contaId] = 0;
      }
    });

    // Total geral do ano
    const totalGeral = Object.values(totaisPorMes).reduce((acc, val) => acc + val, 0);

    // Nomes dos meses para exibição
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    res.render('fluxo-caixa/fluxo', {
      title: `Fluxo de Caixa - ${anoSelecionado}`,
      anoSelecionado: anoSelecionado,
      anosDisponiveis: anosDisponiveis,
      dadosPorContaMes: dadosPorContaMes,
      totaisPorMes: totaisPorMes,
      totaisPorConta: totaisPorConta,
      totalGeral: totalGeral,
      nomesMeses: nomesMeses,
      todasCategorias: todasCategorias,
      TipoConta: TipoConta,
      getTiposContaArray: getTiposContaArray,
      getDescricaoTipoConta: getDescricaoTipoConta,
      getCorTipoConta: getCorTipoConta,
      getIconeTipoConta: getIconeTipoConta,
      // Mensagens são passadas automaticamente via middleware de sessão
    });
  } catch (error) {
    console.error('Erro ao carregar fluxo de caixa:', error);
    res.status(500).render('error', {
      message: 'Erro ao carregar fluxo de caixa',
      error: { status: 500 }
    });
  }
});

/* POST - Criar nova conta via modal do fluxo */
router.post('/fluxo/conta/add', function(req, res, next) {
  try {
    const errors = [];
    const { nomeConta, tipoConta, categoriaId, novaCategoriaNome } = req.body;
    const ano = req.body.ano || new Date().getFullYear();
    let categoriaSelecionadaId = categoriaId;

    // Validações básicas
    if (!nomeConta || nomeConta.trim() === '') errors.push('Nome da conta é obrigatório');
    if (!tipoConta || !getTiposContaArray().includes(tipoConta)) errors.push('Tipo de conta inválido');

    // Verifica se conta já existe
    if (nomeConta && contaExists(nomeConta.trim())) {
      errors.push('Já existe uma conta com este nome');
    }

    // Lógica para categoria (existente ou nova)
    if (categoriaId === 'nova') {
      // Criar nova categoria
      if (!novaCategoriaNome || novaCategoriaNome.trim() === '') {
        errors.push('Nome da nova categoria é obrigatório');
      } else if (novaCategoriaNome.trim().length < 2) {
        errors.push('Nome da categoria deve ter pelo menos 2 caracteres');
      } else if (categoriaExists(novaCategoriaNome.trim())) {
        errors.push('Já existe uma categoria com este nome');
      } else {
        try {
          // Criar nova categoria
          const novaCategoria = new CategoriaConta(null, novaCategoriaNome.trim());
          const categoriaAdicionada = addCategoria(novaCategoria);
          categoriaSelecionadaId = categoriaAdicionada.id;
        } catch (error) {
          console.error('Erro ao criar nova categoria:', error);
          errors.push('Erro ao criar nova categoria');
        }
      }
    } else {
      // Validar categoria existente
      if (!categoriaId) errors.push('Categoria é obrigatória');

      const categoria = getCategoriaById(categoriaId);
      if (!categoria) errors.push('Categoria selecionada não encontrada');
    }

    if (errors.length > 0) {
      // Retorna para a mesma página com erros
      setErrorMessage(req, errors.join(', '));
      return res.redirect(`/fluxo-caixa/fluxo?ano=${ano}`);
    }

    // Criar nova conta com a categoria correta
    const dadosFormulario = { ...req.body, categoriaId: categoriaSelecionadaId };
    const novaConta = Conta.fromFormData(dadosFormulario);
    addConta(novaConta);

    let mensagem = 'Conta adicionada com sucesso!';
    if (categoriaId === 'nova') {
      mensagem = `Conta e categoria "${novaCategoriaNome.trim()}" adicionadas com sucesso!`;
    }

    setSuccessMessage(req, mensagem);
    res.redirect(`/fluxo-caixa/fluxo?ano=${ano}`);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    const ano = req.body.ano || new Date().getFullYear();
    setErrorMessage(req, 'Erro interno do servidor');
    res.redirect(`/fluxo-caixa/fluxo?ano=${ano}`);
  }
});

/* POST - Criar nova movimentação via modal do fluxo */
router.post('/fluxo/movimentacao/add', function(req, res, next) {
  try {
    const errors = [];
    const { contaId, mes, ano, valor } = req.body;
    const anoRedirect = req.body.anoRedirect || new Date().getFullYear();

    // Validações
    if (!contaId) errors.push('Conta é obrigatória');

    // Impedir movimentações na conta especial de saldo anterior
    if (isContaSaldoAnterior(contaId)) {
      errors.push('Não é possível adicionar movimentações na conta de Saldo Anterior');
    }

    if (!mes || isNaN(parseInt(mes)) || parseInt(mes) < 0 || parseInt(mes) > 11) {
      errors.push('Mês inválido');
    }
    if (!ano || isNaN(parseInt(ano))) errors.push('Ano inválido');
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) === 0) {
      errors.push('Valor deve ser um número diferente de zero');
    }

    const conta = getContaById(contaId);
    if (!conta) errors.push('Conta selecionada não encontrada');

    if (errors.length > 0) {
      setErrorMessage(req, errors.join(', '));
      return res.redirect(`/fluxo-caixa/fluxo?ano=${anoRedirect}`);
    }

    // Criar data baseada no mês e ano
    const dataMovimentacao = new Date(parseInt(ano), parseInt(mes), 15); // Dia 15 do mês

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

    setSuccessMessage(req, `Movimentação adicionada com sucesso para ${conta.nomeConta}!`);
    res.redirect(`/fluxo-caixa/fluxo?ano=${anoRedirect}`);
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    const anoRedirect = req.body.anoRedirect || new Date().getFullYear();
    setErrorMessage(req, 'Erro interno do servidor');
    res.redirect(`/fluxo-caixa/fluxo?ano=${anoRedirect}`);
  }
});

/* GET - Relatórios */
router.get('/relatorios', function(req, res, next) {
  try {
    // Período padrão: último mês
    const dataFimDefault = new Date();
    const dataInicioDefault = new Date();
    dataInicioDefault.setMonth(dataInicioDefault.getMonth() - 1);

    const { dataInicio, dataFim } = req.query;

    const dataInicioQuery = dataInicio ? new Date(dataInicio) : dataInicioDefault;
    const dataFimQuery = dataFim ? new Date(dataFim) : dataFimDefault;

    const movimentacoesPeriodo = getContaValoresByPeriodo(dataInicioQuery, dataFimQuery);
    const saldoPeriodo = calcularSaldoPorPeriodo(dataInicioQuery, dataFimQuery);
    const resumoGeral = getResumoFinanceiro();

    // Agrupar por categoria
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

      resumoPorCategoria[categoria].total = resumoPorCategoria[categoria].receitas - resumoPorCategoria[categoria].despesas;
    });

    res.render('fluxo-caixa/relatorios', {
      title: 'Relatórios Financeiros',
      movimentacoesPeriodo: movimentacoesPeriodo,
      saldoPeriodo: saldoPeriodo,
      resumoGeral: resumoGeral,
      resumoPorCategoria: resumoPorCategoria,
      filtros: {
        dataInicio: dataInicioQuery.toISOString().split('T')[0],
        dataFim: dataFimQuery.toISOString().split('T')[0]
      },
      TipoConta: TipoConta,
      getDescricaoTipoConta: getDescricaoTipoConta,
      getCorTipoConta: getCorTipoConta,
      getIconeTipoConta: getIconeTipoConta
    });
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    res.status(500).render('error', {
      message: 'Erro ao carregar relatórios',
      error: { status: 500 }
    });
  }
});

/* GET - Debug: Ver ordem das contas */
router.get('/debug/contas/ordem', function(req, res, next) {
  try {
    const contasOrdenadas = getContasOrdenadas();
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
    console.error('Erro ao obter debug das contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* POST - Salvar nova ordem das contas */
router.post('/fluxo/contas/ordem', function(req, res, next) {
  try {
    const { novaOrdem } = req.body;

    if (!novaOrdem || !Array.isArray(novaOrdem)) {
      return res.status(400).json({
        success: false,
        message: 'Ordem inválida fornecida'
      });
    }

    // Atualizar ordem das contas
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
    console.error('Erro ao salvar ordem das contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;