/**
 * Configuração centralizada do ambiente
 */

// Carregar variáveis de ambiente
import dotenv from 'dotenv';
dotenv.config();

/**
 * Validar variáveis de ambiente obrigatórias
 */
const requiredEnvVars = [
  'NODE_ENV'
];

const optionalEnvVars = [
  'PORT',
  'SESSION_SECRET',
  'SESSION_MAX_AGE',
  'SESSION_SECURE',
  'LOG_LEVEL',
  'MONGODB_URI',
  'ALLOWED_ORIGINS'
];

// Verificar variáveis obrigatórias
const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingRequired.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:', missingRequired.join(', '));
  console.error('💡 Verifique se o arquivo .env está configurado corretamente');
  process.exit(1);
}

/**
 * Configuração do ambiente
 */
const config = {
  // Ambiente
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // Servidor
  PORT: parseInt(process.env.PORT) || 3000,
  HOST: process.env.HOST || 'localhost',

  // Sessão
  session: {
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 horas
    secure: process.env.SESSION_SECURE === 'true',
    name: 'fluxocaixa.sid'
  },

  // Database (para futuro uso)
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    toFile: process.env.LOG_TO_FILE === 'true' || process.env.NODE_ENV === 'production'
  },

  // Segurança
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS ?
      process.env.ALLOWED_ORIGINS.split(',') :
      ['http://localhost:3000'],
    rateLimitWindow: 15 * 60 * 1000, // 15 minutos
    rateLimitMax: 100, // requests por janela
    formRateLimitMax: 50,
    strictRateLimitMax: 5
  },

  // Aplicação
  app: {
    name: process.env.APP_NAME || 'Fluxo de Caixa',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Sistema de Controle de Fluxo de Caixa'
  },

  // Upload de arquivos (para futuro uso)
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES ?
      process.env.ALLOWED_FILE_TYPES.split(',') :
      ['image/jpeg', 'image/png', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // Features flags (para controle de funcionalidades)
  features: {
    enableUserAuth: process.env.ENABLE_USER_AUTH === 'true',
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD === 'true',
    enableApiExport: process.env.ENABLE_API_EXPORT === 'true',
    enableDebugRoutes: process.env.ENABLE_DEBUG_ROUTES === 'true' || process.env.NODE_ENV === 'development'
  }
};

/**
 * Função para obter configuração específica
 */
const get = (key, defaultValue = null) => {
  const keys = key.split('.');
  let value = config;

  for (const k of keys) {
    value = value[k];
    if (value === undefined) {
      return defaultValue;
    }
  }

  return value;
};

/**
 * Função para verificar se está em ambiente específico
 */
const isEnvironment = (env) => {
  return config.NODE_ENV === env;
};

/**
 * Função para validar configuração
 */
const validateConfig = () => {
  const errors = [];

  // Validar porta
  if (isNaN(config.PORT) || config.PORT < 1 || config.PORT > 65535) {
    errors.push('PORT deve ser um número entre 1 e 65535');
  }

  // Validar secret da sessão em produção
  if (config.isProduction && config.session.secret === 'your-super-secret-session-key-change-this') {
    errors.push('SESSION_SECRET deve ser alterado em produção');
  }

  // Validar tempo de sessão
  if (config.session.maxAge < 60000) { // Mínimo 1 minuto
    errors.push('SESSION_MAX_AGE deve ser pelo menos 60000ms (1 minuto)');
  }

  if (errors.length > 0) {
    console.error('❌ Erros na configuração:');
    errors.forEach(error => console.error(`   • ${error}`));
    process.exit(1);
  }

  return true;
};

/**
 * Exibir informações de configuração
 */
const displayConfig = () => {
  if (config.isDevelopment) {
    console.log('🔧 Configuração do Ambiente:');
    console.log(`   • Ambiente: ${config.NODE_ENV}`);
    console.log(`   • Porta: ${config.PORT}`);
    console.log(`   • Host: ${config.HOST}`);
    console.log(`   • Log Level: ${config.logging.level}`);
    console.log(`   • Features Ativas:`, Object.entries(config.features)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(', ') || 'Nenhuma');
  }
};

// Validar configuração na inicialização
validateConfig();

const environmentModule = {
  ...config,
  get,
  isEnvironment,
  validateConfig,
  displayConfig
};

// Exportações ES modules
export default config;
export { config, get, isEnvironment, validateConfig, displayConfig };
