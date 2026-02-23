import session from 'express-session';
import MongoStore from 'connect-mongo';

/**
 * Configuração da sessão baseada no ambiente
 */
const getSessionConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  const baseConfig = {
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this',
    resave: false,
    saveUninitialized: false,
    name: 'fluxocaixa.sid', // Nome customizado para a sessão (esconder express default)
    cookie: {
      secure: isProduction && process.env.SESSION_SECURE === 'true', // HTTPS apenas em produção
      httpOnly: true, // Prevenir acesso via JavaScript
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 horas
      sameSite: isProduction ? 'strict' : 'lax' // Proteção CSRF
    },
    rolling: true // Renovar o cookie a cada request
  };

  // Se tiver MongoDB configurado, usar MongoStore
  if (process.env.MONGODB_URI) {
    baseConfig.store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600, // Lazy session update (24h)
      ttl: parseInt(process.env.SESSION_MAX_AGE) / 1000 || 24 * 60 * 60, // TTL em segundos
      autoRemove: 'native' // Remove sessões expiradas automaticamente
    });
  }
  // Para desenvolvimento ou se não houver MongoDB, usar MemoryStore (padrão)
  // Nota: MemoryStore não deve ser usado em produção

  return baseConfig;
};

/**
 * Middleware para mensagens flash
 */
const flashMessages = (req, res, next) => {
  // Disponibilizar mensagens flash para as views
  res.locals.messages = {
    success: req.session.success || [],
    error: req.session.error || [],
    warning: req.session.warning || [],
    info: req.session.info || []
  };

  // Limpar mensagens após exibir
  delete req.session.success;
  delete req.session.error;
  delete req.session.warning;
  delete req.session.info;

  // Método helper para adicionar mensagens
  req.flash = (type, message) => {
    if (!req.session[type]) {
      req.session[type] = [];
    }
    req.session[type].push(message);
  };

  // Compatibilidade com código legado
  res.locals.message = req.session.message;
  res.locals.error = req.session.error;
  delete req.session.message;
  delete req.session.error;

  next();
};

/**
 * Middleware para dados globais da sessão
 */
const sessionLocals = (req, res, next) => {
  // Disponibilizar dados da sessão para as views
  res.locals.session = req.session;
  res.locals.sessionID = req.sessionID;

  // Informações do usuário (se implementar autenticação)
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;

  // Configurações do ambiente
  res.locals.NODE_ENV = process.env.NODE_ENV;
  res.locals.APP_NAME = process.env.APP_NAME || 'Fluxo de Caixa';
  res.locals.APP_VERSION = process.env.APP_VERSION || '1.0.0';

  next();
};

/**
 * Middleware para regenerar sessão em operações sensíveis
 */
const regenerateSession = (req, res, next) => {
  const originalSession = req.session;

  req.session.regenerate((err) => {
    if (err) {
      return next(err);
    }

    // Restaurar dados importantes da sessão anterior
    Object.assign(req.session, originalSession);

    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  });
};

/**
 * Middleware para limpar dados sensíveis da sessão
 */
const cleanupSession = (req, res, next) => {
  // Remove dados temporários que não devem persistir
  delete req.session.tempData;
  delete req.session.formData;
  delete req.session.errors;

  next();
};

/**
 * Middleware para verificar se a sessão está ativa
 */
const requireActiveSession = (req, res, next) => {
  if (!req.session || !req.sessionID) {
    return res.status(401).json({
      error: 'Sessão inválida ou expirada'
    });
  }

  // Verificar se a sessão não expirou
  const now = new Date();
  const sessionStart = new Date(req.session.cookie._expires);

  if (sessionStart < now) {
    req.session.destroy(() => {
      res.status(401).json({
        error: 'Sessão expirada'
      });
    });
    return;
  }

  next();
};

/**
 * Função para destruir sessão de forma segura
 */
const destroySession = (req, res, callback) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
      return callback(err);
    }

    // Limpar cookie do lado do cliente
    res.clearCookie('fluxocaixa.sid');

    callback(null);
  });
};

export {
  getSessionConfig,
  flashMessages,
  sessionLocals,
  regenerateSession,
  cleanupSession,
  requireActiveSession,
  destroySession
};