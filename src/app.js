// ES modules utilities
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar variáveis de ambiente ANTES de tudo
import config, { displayConfig } from './config/environment.js';

// Imports principais
import express from 'express';
import cookieParser from 'cookie-parser';

// Middleware de segurança e logging
import {
  helmetConfig,
  generalLimiter,
  compressionConfig,
  sanitizeHeaders,
  validateOrigin,
  logSuspiciousActivity
} from './middleware/security.js';

import {
  getSessionConfig,
  flashMessages,
  sessionLocals,
  cleanupSession
} from './middleware/session.js';

import { requestLogger, logger } from './utils/logger.js';
import { globalErrorHandler, notFound } from './utils/errorHandler.js';

// Validar configuração de ambiente
import { validateEnv } from './config/env-validator.js';
validateEnv();

// Routes
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import fluxoCaixaRouter from './routes/fluxo-caixa.js';

// Criar aplicação Express
const app = express();

// ============================================================================
// CONFIGURAÇÃO BÁSICA
// ============================================================================

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Trust proxy (para rate limiting e logging corretos)
app.set('trust proxy', 1);

// ============================================================================
// MIDDLEWARE DE SEGURANÇA
// ============================================================================

// Headers de segurança
app.use(sanitizeHeaders);

// Helmet para security headers
app.use(helmetConfig);

// Compressão
app.use(compressionConfig);

// Rate limiting geral
if (config.isProduction) {
  app.use(generalLimiter);
}

// Log de atividades suspeitas
app.use(logSuspiciousActivity);

// Validação de origem
if (config.isProduction) {
  app.use(validateOrigin);
}

// ============================================================================
// MIDDLEWARE DE REQUEST PROCESSING
// ============================================================================

// Logger de requests
if (config.isDevelopment || config.get('logging.level') === 'debug') {
  app.use(requestLogger);
}

// Parse JSON e URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// ============================================================================
// SESSÃO E FLASH MESSAGES
// ============================================================================

// Configurar sessão
import session from 'express-session';
app.use(session(getSessionConfig()));

// Middleware para mensagens flash
app.use(flashMessages);

// Dados globais da sessão
app.use(sessionLocals);

// ============================================================================
// ARQUIVOS ESTÁTICOS
// ============================================================================

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: config.isProduction ? '1d' : '0', // Cache em produção
  etag: true
}));

// ============================================================================
// ROTAS PRINCIPAIS
// ============================================================================

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/fluxo-caixa', fluxoCaixaRouter);

// ============================================================================
// MIDDLEWARE DE LIMPEZA
// ============================================================================

// Limpar dados temporários da sessão
app.use(cleanupSession);

// ============================================================================
// TRATAMENTO DE ERROS
// ============================================================================

// Capturar 404 e enviar para error handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

// ============================================================================
// TRATAMENTO DE SINAIS DO SISTEMA
// ============================================================================

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Recebido SIGTERM, iniciando shutdown graceful...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recebido SIGINT, iniciando shutdown graceful...');
  process.exit(0);
});

// Tratar erros não capturados
process.on('uncaughtException', (err) => {
  logger.error('Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', { reason, promise });
  process.exit(1);
});

// ============================================================================
// INFORMAÇÕES DE STARTUP
// ============================================================================

if (config.isDevelopment) {
  logger.info(`🚀 ${config.app.name} v${config.app.version} iniciado`);
  logger.info(`📊 Ambiente: ${config.NODE_ENV}`);
  logger.info(`🌐 Servidor rodando na porta: ${config.PORT}`);

  // Exibir configuração em desenvolvimento
  displayConfig();
}

export default app;
