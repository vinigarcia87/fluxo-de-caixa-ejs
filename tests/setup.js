/**
 * Configuração global para testes Jest
 */

// Mock do console para testes mais limpos (opcional)
if (process.env.NODE_ENV === 'test') {
  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
}

// Configurações globais para testes
global.testConfig = {
  timeout: 5000,
  port: 3001,
  testDatabase: 'fluxo_caixa_test'
};

// Helpers globais para testes
global.testHelpers = {
  // Helper para criar dados de teste
  createTestMovimentacao: (override = {}) => ({
    contaId: 1,
    data: '2024-01-15',
    valor: 100.00,
    ...override
  }),

  createTestConta: (override = {}) => ({
    nomeConta: 'Conta Teste',
    tipoConta: 'RECEITA',
    categoriaId: 1,
    ...override
  }),

  // Helper para simular delay
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper para gerar dados aleatórios
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  randomNumber: (min = 1, max = 1000) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configurar timeout global
jest.setTimeout(global.testConfig.timeout);