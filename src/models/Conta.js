const { TipoConta, isValidTipoConta } = require('./TipoConta');
const { CategoriaConta, getCategoriaById } = require('./CategoriaConta');

// Classe Conta
class Conta {
  constructor(id, nomeConta, tipoConta, categoriaConta, ordemTabela = null) {
    this.id = id;
    this.nomeConta = nomeConta;
    this.tipoConta = tipoConta;
    this.categoriaConta = categoriaConta; // Instância de CategoriaConta
    this.ordemTabela = ordemTabela; // Número da ordem na tabela (0 = primeira linha)
  }

  // Método para validar se a conta está válida
  isValid() {
    return (
      this.nomeConta && this.nomeConta.trim() !== '' &&
      isValidTipoConta(this.tipoConta) &&
      this.categoriaConta && this.categoriaConta instanceof CategoriaConta
    );
  }

  // Método toString para facilitar exibição
  toString() {
    return `${this.nomeConta} (${this.tipoConta})`;
  }

  // Método para criar uma nova instância a partir de dados do formulário
  static fromFormData(formData) {
    const categoria = getCategoriaById(formData.categoriaId);
    return new Conta(
      formData.id || null,
      formData.nomeConta || '',
      formData.tipoConta || '',
      categoria
    );
  }

  // Método para converter para objeto simples (para JSON)
  toJSON() {
    return {
      id: this.id,
      nomeConta: this.nomeConta,
      tipoConta: this.tipoConta,
      categoriaConta: this.categoriaConta ? this.categoriaConta.toJSON() : null,
      ordemTabela: this.ordemTabela
    };
  }

  // Método para obter descrição completa
  getDescricaoCompleta() {
    return `${this.nomeConta} - ${this.categoriaConta?.categoria || 'Sem categoria'}`;
  }
}

// Array temporário para armazenar contas (simula banco de dados)
let contas = [
  new Conta(1, 'Supermercado', TipoConta.DESPESA, getCategoriaById(1)),
  new Conta(2, 'Combustível', TipoConta.DESPESA, getCategoriaById(2)),
  new Conta(3, 'Salário Principal', TipoConta.RECEITA, getCategoriaById(7)),
  new Conta(4, 'Freelance Design', TipoConta.RECEITA, getCategoriaById(8)),
  new Conta(5, 'Aluguel', TipoConta.DESPESA, getCategoriaById(6)),
  new Conta(999, 'Saldo Anterior', TipoConta.SALDO, getCategoriaById(11)) // Conta especial fixa
];

// Contador para IDs únicos
let nextContaId = 7;

// ID da conta especial de saldo anterior (não pode ser alterada)
const CONTA_SALDO_ANTERIOR_ID = 999;

// Funções para manipulação das contas
function getAllContas() {
  return contas;
}

function getContaById(id) {
  return contas.find(c => c.id === parseInt(id));
}

function getContasByTipo(tipoConta) {
  return contas.filter(c => c.tipoConta === tipoConta);
}

function getContasByCategoria(categoriaId) {
  return contas.filter(c => c.categoriaConta && c.categoriaConta.id === parseInt(categoriaId));
}

function addConta(conta) {
  if (conta instanceof Conta) {
    conta.id = nextContaId++;
    contas.push(conta);
    return conta;
  }
  throw new Error('Objeto deve ser uma instância de Conta');
}

function updateConta(id, novaConta) {
  const index = contas.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    contas[index].nomeConta = novaConta.nomeConta;
    contas[index].tipoConta = novaConta.tipoConta;
    contas[index].categoriaConta = novaConta.categoriaConta;
    return contas[index];
  }
  return null;
}

function deleteConta(id) {
  const index = contas.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    return contas.splice(index, 1)[0];
  }
  return null;
}

function contaExists(nomeConta, excludeId = null) {
  return contas.some(c =>
    c.nomeConta.toLowerCase() === nomeConta.toLowerCase() &&
    c.id !== excludeId
  );
}

// Funções específicas para a conta especial de saldo anterior
function getContaSaldoAnterior() {
  return contas.find(c => c.id === CONTA_SALDO_ANTERIOR_ID);
}

function isContaSaldoAnterior(contaId) {
  return parseInt(contaId) === CONTA_SALDO_ANTERIOR_ID;
}

function getContasEditaveis() {
  return contas.filter(c => c.id !== CONTA_SALDO_ANTERIOR_ID);
}

function getContasParaModal() {
  // Retorna todas as contas exceto a de saldo anterior (para modals de criação de movimentação)
  return contas.filter(c => c.id !== CONTA_SALDO_ANTERIOR_ID);
}

// Funções para ordenação das contas
function definirOrdemPorCategoria() {
  // Definir ordem numérica sequencial baseada no TIPO da conta
  // 1. Saldo Anterior (conta especial) = 0 (fixo)
  // 2. Contas tipo SALDO = 1, 2, 3... (alfabética por nome da conta)
  // 3. Contas tipo RECEITA = seguem sequência (alfabética por nome da conta)
  // 4. Contas tipo DESPESA = seguem sequência (alfabética por nome da conta)

  // Separar contas por grupos baseado no TIPO
  const contaSaldoAnterior = contas.find(c => c.id === CONTA_SALDO_ANTERIOR_ID);
  const contasSaldo = contas.filter(c =>
    c.id !== CONTA_SALDO_ANTERIOR_ID &&
    c.tipoConta === 'SALDO'
  );
  const contasReceita = contas.filter(c =>
    c.id !== CONTA_SALDO_ANTERIOR_ID &&
    c.tipoConta === 'RECEITA'
  );
  const contasDespesa = contas.filter(c =>
    c.id !== CONTA_SALDO_ANTERIOR_ID &&
    c.tipoConta === 'DESPESA'
  );

  // Ordenar cada grupo alfabeticamente por nome da conta
  const ordenarPorNome = (a, b) => {
    const nomeA = a.nomeConta?.toLowerCase() || '';
    const nomeB = b.nomeConta?.toLowerCase() || '';
    return nomeA.localeCompare(nomeB);
  };

  contasSaldo.sort(ordenarPorNome);
  contasReceita.sort(ordenarPorNome);
  contasDespesa.sort(ordenarPorNome);

  // Atribuir números sequenciais
  let ordemAtual = 0;

  // 1. Saldo Anterior = 0
  if (contaSaldoAnterior) {
    contaSaldoAnterior.ordemTabela = ordemAtual++;
  }

  // 2. Contas do tipo SALDO = 1, 2, 3...
  contasSaldo.forEach(conta => {
    conta.ordemTabela = ordemAtual++;
  });

  // 3. Contas do tipo RECEITA = continuam a sequência
  contasReceita.forEach(conta => {
    conta.ordemTabela = ordemAtual++;
  });

  // 4. Contas do tipo DESPESA = continuam a sequência
  contasDespesa.forEach(conta => {
    conta.ordemTabela = ordemAtual++;
  });
}

function inicializarOrdemTabela() {
  // Aplicar ordem apenas se as contas não têm ordem definida
  const temContaSemOrdem = contas.some(c => c.ordemTabela === null || c.ordemTabela === undefined);

  if (temContaSemOrdem) {
    definirOrdemPorCategoria();
  }
}

function getContasOrdenadas() {
  // Garantir que todas as contas tenham ordem definida
  inicializarOrdemTabela();

  // Ordenar por número da ordem na tabela (0 = primeiro)
  return [...contas].sort((a, b) => {
    const ordemA = a.ordemTabela ?? 999;
    const ordemB = b.ordemTabela ?? 999;
    return ordemA - ordemB;
  });
}

function atualizarOrdemContas(novaOrdem) {
  // novaOrdem é um array de IDs na nova ordem definida pelo usuário
  // Renumerar todas as contas baseado na nova posição

  if (!Array.isArray(novaOrdem)) return false;

  // Garantir que Saldo Anterior esteja sempre na posição 0
  const ordemFinal = [];

  // Se Saldo Anterior não está na primeira posição, colocá-lo lá
  if (novaOrdem[0] !== CONTA_SALDO_ANTERIOR_ID && novaOrdem.includes(CONTA_SALDO_ANTERIOR_ID)) {
    ordemFinal.push(CONTA_SALDO_ANTERIOR_ID);
    ordemFinal.push(...novaOrdem.filter(id => parseInt(id) !== CONTA_SALDO_ANTERIOR_ID));
  } else {
    ordemFinal.push(...novaOrdem);
  }

  // Renumerar todas as contas baseado na nova ordem
  ordemFinal.forEach((contaId, index) => {
    const conta = getContaById(contaId);
    if (conta) {
      conta.ordemTabela = index;
    }
  });

  return true;
}

// Função para forçar reorganização com nova ordem de categorias
function reorganizarContasPorCategoria() {
  // Resetar todas as ordens para forçar nova definição
  contas.forEach(conta => {
    conta.ordemTabela = null;
  });

  // Aplicar nova ordem baseada em categorias
  definirOrdemPorCategoria();

  return true;
}

module.exports = {
  Conta,
  getAllContas,
  getContaById,
  getContasByTipo,
  getContasByCategoria,
  addConta,
  updateConta,
  deleteConta,
  contaExists,
  getContaSaldoAnterior,
  isContaSaldoAnterior,
  getContasEditaveis,
  getContasParaModal,
  getContasOrdenadas,
  inicializarOrdemTabela,
  atualizarOrdemContas,
  reorganizarContasPorCategoria,
  definirOrdemPorCategoria,
  CONTA_SALDO_ANTERIOR_ID
};