// Validador de variáveis de ambiente
// Este arquivo verifica se todas as variáveis obrigatórias estão definidas

const requiredEnvVars = {
  development: [
    'NODE_ENV',
    'PORT',
    'SESSION_SECRET'
  ],
  production: [
    'NODE_ENV',
    'SESSION_SECRET',
    'BASE_URL'
  ]
};

const warningVars = {
  production: [
    { var: 'SESSION_SECURE', expected: 'true', message: 'Recomenda-se true em produção com HTTPS' },
    { var: 'DEBUG', expected: 'false', message: 'Recomenda-se false em produção' }
  ]
};

function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  const warnings = warningVars[env] || [];

  console.log(`🔍 Validando variáveis de ambiente para: ${env.toUpperCase()}`);

  // Verificar variáveis obrigatórias
  const missing = [];
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Variáveis obrigatórias não encontradas:`);
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error(`\n📖 Consulte: DOCS/VARIAVEIS-AMBIENTE.md`);
    process.exit(1);
  }

  // Verificar warnings
  warnings.forEach(warning => {
    const value = process.env[warning.var];
    if (value !== warning.expected) {
      console.warn(`⚠️  ${warning.var}: ${warning.message}`);
      console.warn(`   Atual: ${value || 'undefined'}, Recomendado: ${warning.expected}`);
    }
  });

  // Validar SESSION_SECRET
  const sessionSecret = process.env.SESSION_SECRET;
  if (sessionSecret) {
    if (sessionSecret.length < 32) {
      console.warn(`⚠️  SESSION_SECRET muito curta. Use pelo menos 32 caracteres.`);
    }
    if (env === 'production' && sessionSecret.includes('dev')) {
      console.warn(`⚠️  SESSION_SECRET parece ser de desenvolvimento em produção!`);
    }
  }

  console.log(`✅ Validação de ambiente concluída\n`);

  return {
    isValid: missing.length === 0,
    missing,
    environment: env
  };
}

module.exports = { validateEnv };

// Executar validação se chamado diretamente
if (require.main === module) {
  require('dotenv').config();
  validateEnv();
}