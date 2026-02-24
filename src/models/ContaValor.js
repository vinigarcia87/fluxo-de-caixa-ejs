import { Conta, getContaById, getContaSaldoAnterior, CONTA_SALDO_ANTERIOR_ID } from './Conta.js';

// Classe ContaValor
class ContaValor {
  constructor(id, data, valor, conta) {
    this.id = id;
    this.data = data; // Objeto Date
    this.valor = parseFloat(parseFloat(valor).toFixed(2)); // Número com 2 casas decimais
    this.conta = conta; // Instância de Conta
  }

  // Método para validar se a entrada está válida
  isValid() {
    return (
      this.data instanceof Date && !isNaN(this.data) &&
      !isNaN(this.valor) && this.valor !== 0 &&
      this.conta && this.conta instanceof Conta
    );
  }

  // Método toString para facilitar exibição
  toString() {
    return `${this.conta?.nomeConta || 'Sem conta'}: ${this.getValorFormatado()} em ${this.getDataFormatada()}`;
  }

  // Método para criar uma nova instância a partir de dados do formulário
  static fromFormData(formData) {
    const conta = getContaById(formData.contaId);
    const data = formData.data ? new Date(formData.data + 'T00:00:00.000Z') : new Date();
    const valor = parseFloat(formData.valor) || 0;

    return new ContaValor(
      formData.id || null,
      data,
      valor,
      conta
    );
  }

  // Método para converter para objeto simples (para JSON)
  toJSON() {
    return {
      id: this.id,
      data: this.data.toISOString().split('T')[0], // YYYY-MM-DD
      valor: this.valor,
      conta: this.conta ? this.conta.toJSON() : null
    };
  }

  // Método para obter valor formatado em moeda brasileira
  getValorFormatado() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.valor);
  }

  // Método para obter data formatada em formato brasileiro
  getDataFormatada() {
    return this.data.toLocaleDateString('pt-BR');
  }

  // Método para obter data no formato input (YYYY-MM-DD)
  getDataInput() {
    return this.data.toISOString().split('T')[0];
  }

  // Método para verificar se é receita ou despesa
  isReceita() {
    return this.conta && this.conta.tipoConta === 'RECEITA';
  }

  isDespesa() {
    return this.conta && this.conta.tipoConta === 'DESPESA';
  }

  isSaldo() {
    return this.conta && this.conta.tipoConta === 'SALDO';
  }

  // Método para obter valor com sinal (+ para receita, - para despesa)
  getValorComSinal() {
    if (this.isReceita()) return this.valor;
    if (this.isDespesa()) return -this.valor;
    return this.valor; // Para saldo, mantém como está
  }
}

// Array temporário para armazenar valores (simula banco de dados)
let contaValores = [
  new ContaValor(1, new Date('2025-02-01'), 5000.00, getContaById(3)), // Salário
  new ContaValor(3, new Date('2025-02-02'), 150.50, getContaById(1)), // Supermercado
  new ContaValor(4, new Date('2025-02-03'), 80.00, getContaById(2)), // Combustível
  new ContaValor(5, new Date('2025-02-05'), 1200.00, getContaById(5)), // Aluguel
  new ContaValor(6, new Date('2025-02-10'), 800.00, getContaById(4)), // Freelance
  new ContaValor(7, new Date('2025-02-12'), 250.75, getContaById(1)), // Supermercado
  new ContaValor(8, new Date('2025-02-15'), 120.00, getContaById(2)) // Combustível
];

// Contador para IDs únicos
let nextContaValorId = 9;

// Funções para manipulação dos valores
function getAllContaValores() {
  return contaValores.sort((a, b) => new Date(b.data) - new Date(a.data)); // Ordenar por data decrescente
}

function getContaValorById(id) {
  return contaValores.find(cv => cv.id === parseInt(id));
}

function getContaValoresByPeriodo(dataInicio, dataFim) {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  fim.setHours(23, 59, 59, 999); // Incluir todo o dia final

  return contaValores.filter(cv =>
    cv.data >= inicio && cv.data <= fim
  ).sort((a, b) => new Date(b.data) - new Date(a.data));
}

function getContaValoresByConta(contaId) {
  return contaValores.filter(cv =>
    cv.conta && cv.conta.id === parseInt(contaId)
  ).sort((a, b) => new Date(b.data) - new Date(a.data));
}

function getContaValoresByTipo(tipoConta) {
  return contaValores.filter(cv =>
    cv.conta && cv.conta.tipoConta === tipoConta
  ).sort((a, b) => new Date(b.data) - new Date(a.data));
}

function addContaValor(contaValor) {
  if (contaValor instanceof ContaValor) {
    contaValor.id = nextContaValorId++;
    contaValores.push(contaValor);
    return contaValor;
  }
  throw new Error('Objeto deve ser uma instância de ContaValor');
}

function updateContaValor(id, novaContaValor) {
  const index = contaValores.findIndex(cv => cv.id === parseInt(id));
  if (index !== -1) {
    contaValores[index].data = novaContaValor.data;
    contaValores[index].valor = novaContaValor.valor;
    contaValores[index].conta = novaContaValor.conta;
    return contaValores[index];
  }
  return null;
}

function deleteContaValor(id) {
  const index = contaValores.findIndex(cv => cv.id === parseInt(id));
  if (index !== -1) {
    return contaValores.splice(index, 1)[0];
  }
  return null;
}

// Funções para cálculos e relatórios
function calcularSaldoAtual() {
  let saldo = 0;

  contaValores.forEach(cv => {
    saldo += cv.getValorComSinal();
  });

  return parseFloat(saldo.toFixed(2));
}

function calcularTotalPorTipo(tipoConta) {
  return contaValores
    .filter(cv => cv.conta && cv.conta.tipoConta === tipoConta)
    .reduce((total, cv) => total + cv.valor, 0);
}

function calcularSaldoPorPeriodo(dataInicio, dataFim) {
  const valores = getContaValoresByPeriodo(dataInicio, dataFim);
  let saldo = 0;

  valores.forEach(cv => {
    saldo += cv.getValorComSinal();
  });

  return parseFloat(saldo.toFixed(2));
}

function getResumoFinanceiro() {
  const receitas = calcularTotalPorTipo('RECEITA');
  const despesas = calcularTotalPorTipo('DESPESA');
  const saldos = calcularTotalPorTipo('SALDO');
  const saldoAtual = calcularSaldoAtual();

  return {
    receitas: parseFloat(receitas.toFixed(2)),
    despesas: parseFloat(despesas.toFixed(2)),
    saldos: parseFloat(saldos.toFixed(2)),
    saldoAtual: saldoAtual,
    resultado: parseFloat((receitas - despesas).toFixed(2))
  };
}

// Função para calcular e inserir saldos anteriores automaticamente
// REGRA: Calcula saldos anteriores apenas até o mês atual (não para meses futuros)
function calcularESalvarSaldosAnteriores(ano) {
  const contaSaldoAnterior = getContaSaldoAnterior();
  if (!contaSaldoAnterior) return;

  // Remove todas as movimentações da conta saldo anterior do ano especificado
  const indicesParaRemover = [];
  contaValores.forEach((cv, index) => {
    if (cv.conta && cv.conta.id === CONTA_SALDO_ANTERIOR_ID && cv.data.getFullYear() === ano) {
      indicesParaRemover.push(index);
    }
  });

  // Remove de trás para frente para não alterar índices
  indicesParaRemover.reverse().forEach(index => {
    contaValores.splice(index, 1);
  });

  // Calcular saldo inicial (saldo do ano anterior ou 0 se primeiro ano)
  let saldoInicial = 0;

  // Verificar se não é o primeiro ano com dados
  const movimentacoesSemSaldoAnterior = contaValores.filter(cv => cv.conta && cv.conta.id !== CONTA_SALDO_ANTERIOR_ID);
  if (movimentacoesSemSaldoAnterior.length > 0) {
    const primeiroAno = Math.min(...movimentacoesSemSaldoAnterior.map(cv => cv.data.getFullYear()));

    if (ano > primeiroAno) {
      // Calcular saldo acumulado até o final do ano anterior
      const anoAnterior = ano - 1;
      const dataInicioAnterior = new Date(primeiroAno, 0, 1);
      const dataFimAnterior = new Date(anoAnterior, 11, 31, 23, 59, 59);

      const movimentacoesAteAnoAnterior = contaValores.filter(cv =>
        cv.conta && cv.conta.id !== CONTA_SALDO_ANTERIOR_ID &&
        cv.data >= dataInicioAnterior &&
        cv.data <= dataFimAnterior
      );

      saldoInicial = movimentacoesAteAnoAnterior.reduce((acc, cv) => acc + cv.getValorComSinal(), 0);
    }
  }

  // Variável para acompanhar saldo mês a mês
  let saldoAcumuladoAtual = saldoInicial;

  // Determinar até qual mês calcular o saldo anterior
  // - Anos passados: calcular todos os 12 meses (0-11)
  // - Ano atual: calcular apenas até o mês atual (não calcular meses futuros)
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth();
  const ultimoMes = (ano === anoAtual) ? mesAtual : 11;

  // Para cada mês do ano, criar entrada de saldo anterior
  for (let mes = 0; mes <= ultimoMes; mes++) {
    // O saldo anterior do mês é o saldo acumulado até o final do mês anterior
    const saldoAnteriorMes = saldoAcumuladoAtual;

    // Criar movimentação de saldo anterior para o mês atual
    const dataMovimentacao = new Date(ano, mes, 1); // Primeiro dia do mês
    const novaSaldoAnterior = new ContaValor(
      nextContaValorId++, // Gerar ID único
      dataMovimentacao,
      saldoAnteriorMes,
      contaSaldoAnterior
    );

    contaValores.push(novaSaldoAnterior);

    // Calcular movimentações do mês atual (exceto saldo anterior) para atualizar saldo acumulado
    const movimentacoesMesAtual = contaValores.filter(cv =>
      cv.conta && cv.conta.id !== CONTA_SALDO_ANTERIOR_ID &&
      cv.data.getFullYear() === ano &&
      cv.data.getMonth() === mes
    );

    // Adicionar movimentações do mês atual ao saldo acumulado
    movimentacoesMesAtual.forEach(cv => {
      saldoAcumuladoAtual += cv.getValorComSinal();
    });
  }
}

// Função para recalcular saldos de um ano específico
function recalcularSaldosAno(ano) {
  calcularESalvarSaldosAnteriores(ano);

  // Se há dados no próximo ano, recalcular também
  const proximoAno = ano + 1;
  const temDadosProximoAno = contaValores.some(cv =>
    cv.data.getFullYear() === proximoAno && cv.conta && cv.conta.id !== CONTA_SALDO_ANTERIOR_ID
  );

  if (temDadosProximoAno) {
    calcularESalvarSaldosAnteriores(proximoAno);
  }
}

// Exportações ES modules
export {
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
};

export default ContaValor;