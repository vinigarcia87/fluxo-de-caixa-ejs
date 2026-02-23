/**
 * Configuração de ambiente para testes
 */

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SESSION_SECRET = 'test-secret-key-for-testing';
process.env.LOG_LEVEL = 'error'; // Reduzir logs durante testes