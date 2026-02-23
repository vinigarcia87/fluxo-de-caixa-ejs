module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',

  // Diretórios de teste
  testMatch: [
    '**/tests/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Arquivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/public/',
    '/views/'
  ],

  // Configuração de cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'config/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Diretório de relatórios de cobertura
  coverageDirectory: 'coverage',

  // Formato dos relatórios de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  // Limites mínimos de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Setup global para testes
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Timeout para testes
  testTimeout: 10000,

  // Configuração de módulos
  moduleFileExtensions: ['js', 'json'],

  // Transformações
  transform: {},

  // Mock para arquivos estáticos
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },

  // Verbose para saída detalhada
  verbose: true,

  // Detectar arquivos abertos
  detectOpenHandles: true,

  // Forçar saída após testes
  forceExit: true,

  // Configurações de ambiente para testes
  setupFiles: ['<rootDir>/tests/env.js']
};