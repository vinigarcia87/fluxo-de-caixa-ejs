// Enumerador para tipos de conta
const TipoConta = {
  DESPESA: 'DESPESA',
  RECEITA: 'RECEITA',
  SALDO: 'SALDO'
};

// Função para validar se um tipo é válido
function isValidTipoConta(tipo) {
  return Object.values(TipoConta).includes(tipo);
}

// Função para obter todos os tipos como array
function getTiposContaArray() {
  return Object.values(TipoConta);
}

// Função para obter descrição amigável do tipo
function getDescricaoTipoConta(tipo) {
  const descricoes = {
    [TipoConta.DESPESA]: 'Despesa',
    [TipoConta.RECEITA]: 'Receita',
    [TipoConta.SALDO]: 'Saldo'
  };
  return descricoes[tipo] || tipo;
}

// Função para obter cor/classe CSS baseada no tipo
function getCorTipoConta(tipo) {
  const cores = {
    [TipoConta.DESPESA]: 'danger',
    [TipoConta.RECEITA]: 'success',
    [TipoConta.SALDO]: 'primary'
  };
  return cores[tipo] || 'secondary';
}

// Função para obter ícone baseado no tipo
function getIconeTipoConta(tipo) {
  const icones = {
    [TipoConta.DESPESA]: 'bi-arrow-down-circle',
    [TipoConta.RECEITA]: 'bi-arrow-up-circle',
    [TipoConta.SALDO]: 'bi-cash-stack'
  };
  return icones[tipo] || 'bi-circle';
}

module.exports = {
  TipoConta,
  isValidTipoConta,
  getTiposContaArray,
  getDescricaoTipoConta,
  getCorTipoConta,
  getIconeTipoConta
};