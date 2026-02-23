const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

/**
 * Configuração do Helmet para segurança
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:"
      ],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false // Desabilitar para compatibilidade com alguns CDNs
});

/**
 * Rate limiting geral
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela de tempo
  message: 'Muitas tentativas, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiting específico para forms de criação/edição
 */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 submissões por IP por janela de tempo
  message: 'Muitas submissões de formulário, aguarde 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiting mais restrito para operações sensíveis
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 requests por IP por janela de tempo
  message: 'Muitas tentativas para operação sensível, aguarde 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Configuração de compressão
 */
const compressionConfig = compression({
  level: 6, // Nível de compressão (1-9)
  threshold: 1024, // Só comprimir arquivos maiores que 1KB
  filter: (req, res) => {
    // Não comprimir se o request já tem 'x-no-compression'
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Usar filtro padrão do compression
    return compression.filter(req, res);
  }
});

/**
 * Middleware de sanitização de headers
 */
const sanitizeHeaders = (req, res, next) => {
  // Remover headers potencialmente perigosos
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-server'];

  // Adicionar headers de segurança customizados
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remover header que revela informações sobre o servidor
  res.removeHeader('X-Powered-By');

  next();
};

/**
 * Middleware para validar origem das requisições
 */
const validateOrigin = (req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',') :
    ['http://localhost:3000'];

  const origin = req.get('origin');

  // Para requests sem origin (navegação direta), permitir
  if (!origin) {
    return next();
  }

  // Verificar se a origem é permitida
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    return next();
  }

  // Origem não permitida
  return res.status(403).json({
    error: 'Origem não permitida'
  });
};

/**
 * Middleware para logging de tentativas suspeitas
 */
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\/wp-admin/i,
    /\/admin\/phpMyAdmin/i,
    /\/phpmyadmin/i,
    /\.env$/i,
    /\/\.git/i,
    /\/config\.json$/i,
    /\/package\.json$/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(req.originalUrl)
  );

  if (isSuspicious) {
    console.warn(`Tentativa suspeita detectada: ${req.method} ${req.originalUrl} de ${req.ip}`);
    // Opcionalmente, você pode retornar 404 para não revelar que detectou a tentativa
    return res.status(404).json({ error: 'Not found' });
  }

  next();
};

/**
 * Middleware para prevenir ataques de força bruta em endpoints específicos
 */
const bruteForceProtection = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.ip}_${req.originalUrl}`;
    const now = Date.now();

    // Limpar tentativas antigas
    for (const [k, v] of attempts.entries()) {
      if (now - v.firstAttempt > windowMs) {
        attempts.delete(k);
      }
    }

    // Verificar tentativas atuais
    const userAttempts = attempts.get(key);

    if (userAttempts && userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        error: 'Muitas tentativas. Aguarde antes de tentar novamente.'
      });
    }

    // Registrar tentativa
    if (!userAttempts) {
      attempts.set(key, { count: 1, firstAttempt: now });
    } else {
      userAttempts.count++;
    }

    next();
  };
};

module.exports = {
  helmetConfig,
  generalLimiter,
  formLimiter,
  strictLimiter,
  compressionConfig,
  sanitizeHeaders,
  validateOrigin,
  logSuspiciousActivity,
  bruteForceProtection
};