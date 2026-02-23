/**
 * Serviço de Usuários
 * Lógica de negócio para operações de usuários
 */

const {
  User,
  getAllUsers,
  getUserById,
  emailExists,
  cpfExists,
  addUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../models/User');

const { AppError } = require('../utils/errorHandler');
const path = require('path');

// Logger melhorado para operações de serviço
const logger = {
  info: (message, meta) => console.log(`[SERVICE] ${new Date().toISOString()} ${message}`, meta ? JSON.stringify(meta, null, 2) : ''),
  error: (message, error) => console.error(`[SERVICE] ${new Date().toISOString()} ${message}`, error || ''),
  warn: (message, meta) => console.warn(`[SERVICE] ${new Date().toISOString()} ${message}`, meta || ''),
  debug: (message, meta) => console.debug(`[SERVICE] ${new Date().toISOString()} ${message}`, meta || ''),
  fileUpload: (filename, size, mimetype, userId) => {
    console.log(`[SERVICE] ${new Date().toISOString()} 📤 File processed`, { filename, size, mimetype, userId });
  }
};
const fs = require('fs');
const sharp = require('sharp');

class UserService {
  /**
   * Obter todos os usuários
   */
  async getAllUsers() {
    try {
      const users = getAllUsers();
      logger.info(`Listando ${users.length} usuários`);
      return users;
    } catch (error) {
      logger.error('Erro ao listar usuários', error);
      throw new AppError('Erro ao carregar lista de usuários', 500);
    }
  }

  /**
   * Obter usuário por ID
   */
  async getUserById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new AppError('ID do usuário inválido', 400);
      }

      const user = getUserById(id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      logger.info(`Usuário encontrado: ID ${id}`);
      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao buscar usuário por ID', error);
      throw new AppError('Erro ao buscar usuário', 500);
    }
  }

  /**
   * Criar novo usuário
   */
  async createUser(userData, photoFile = null) {
    try {
      // Criar instância do usuário e validar
      const user = User.fromFormData(userData);
      const validationErrors = user.validate();

      if (validationErrors.length > 0) {
        throw new AppError(validationErrors.join(', '), 400);
      }

      // Verificar duplicatas
      if (emailExists(user.email)) {
        throw new AppError('Email já cadastrado', 400);
      }

      if (cpfExists(user.cpf)) {
        throw new AppError('CPF já cadastrado', 400);
      }

      // Processar foto se fornecida
      let photoFilename = null;
      if (photoFile) {
        photoFilename = await this._processUserPhoto(photoFile.buffer, null);
      }

      // Criar usuário
      const newUser = addUser({
        ...userData,
        foto: photoFilename,
        cpf: User.formatCPF(userData.cpf)
      });

      logger.info(`Usuário criado: ID ${newUser.id}, Email: ${newUser.email}`);
      return newUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao criar usuário', error);
      throw new AppError('Erro ao criar usuário', 500);
    }
  }

  /**
   * Atualizar usuário existente
   */
  async updateUser(id, userData, photoFile = null) {
    try {
      // Verificar se usuário existe
      const existingUser = await this.getUserById(id);

      // Validar dados
      const user = User.fromFormData(userData);
      const validationErrors = user.validate();

      if (validationErrors.length > 0) {
        throw new AppError(validationErrors.join(', '), 400);
      }

      // Verificar duplicatas (excluindo o próprio usuário)
      if (emailExists(user.email, parseInt(id))) {
        throw new AppError('Email já cadastrado', 400);
      }

      if (cpfExists(user.cpf, parseInt(id))) {
        throw new AppError('CPF já cadastrado', 400);
      }

      // Processar nova foto se fornecida
      let photoFilename = existingUser.foto;
      if (photoFile) {
        // Remover foto antiga
        if (existingUser.foto) {
          await this._deleteUserPhoto(existingUser.foto);
        }

        // Processar nova foto
        photoFilename = await this._processUserPhoto(photoFile.buffer, id);
      }

      // Atualizar usuário
      const updatedUser = updateUser(id, {
        ...userData,
        foto: photoFilename,
        cpf: User.formatCPF(userData.cpf)
      });

      logger.info(`Usuário atualizado: ID ${id}`);
      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao atualizar usuário', error);
      throw new AppError('Erro ao atualizar usuário', 500);
    }
  }

  /**
   * Remover usuário
   */
  async deleteUser(id) {
    try {
      const user = await this.getUserById(id);

      // Remover foto se existir
      if (user.foto) {
        await this._deleteUserPhoto(user.foto);
      }

      // Remover usuário
      const deletedUser = deleteUser(id);

      logger.info(`Usuário removido: ID ${id}, Email: ${user.email}`);
      return deletedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao remover usuário', error);
      throw new AppError('Erro ao remover usuário', 500);
    }
  }

  /**
   * Obter estatísticas dos usuários
   */
  async getUserStats() {
    try {
      const stats = getUserStats();
      logger.info('Estatísticas de usuários geradas');
      return stats;
    } catch (error) {
      logger.error('Erro ao gerar estatísticas', error);
      throw new AppError('Erro ao gerar estatísticas', 500);
    }
  }

  /**
   * Processar e salvar foto do usuário
   * @private
   */
  async _processUserPhoto(buffer, userId) {
    try {
      const timestamp = Date.now();
      const filename = `user-${userId || 'new'}-${timestamp}.jpg`;

      // Caminho para salvar a imagem
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'users');
      const filepath = path.join(uploadDir, filename);

      // Garantir que o diretório existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Redimensionar e processar a imagem
      await sharp(buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 90,
          progressive: true
        })
        .toFile(filepath);

      logger.fileUpload(filename, buffer.length, 'image/jpeg', userId || 'new');
      logger.info(`📸 Foto processada e salva`, {
        filename,
        originalSize: `${buffer.length} bytes`,
        processedSize: '300x300px',
        quality: '90%',
        userId: userId || 'new'
      });
      return filename;
    } catch (error) {
      logger.error('Erro ao processar foto', error);
      throw new AppError('Erro ao processar foto', 500);
    }
  }

  /**
   * Remover foto do usuário
   * @private
   */
  async _deleteUserPhoto(filename) {
    try {
      const filepath = path.join(process.cwd(), 'public', 'uploads', 'users', filename);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        logger.info(`🗑️ Foto removida do disco`, {
          filename,
          path: filepath,
          action: 'file-deleted'
        });
      }
    } catch (error) {
      logger.error(`Erro ao remover foto ${filename}`, error);
      // Não lançar erro aqui para não interromper outras operações
    }
  }

  /**
   * Verificar se usuário existe
   */
  async userExists(id) {
    try {
      const user = getUserById(id);
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Buscar usuários por termo
   */
  async searchUsers(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllUsers();
      }

      const allUsers = getAllUsers();
      const term = searchTerm.toLowerCase().trim();

      const filteredUsers = allUsers.filter(user =>
        user.nome.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.cpf.includes(term) ||
        user.telefone.includes(term)
      );

      logger.info(`🔍 Busca de usuários realizada`, {
        searchTerm,
        totalResults: filteredUsers.length,
        totalUsers: allUsers.length,
        searchFields: ['nome', 'email', 'cpf', 'telefone']
      });
      return filteredUsers;
    } catch (error) {
      logger.error('Erro na busca de usuários', error);
      throw new AppError('Erro na busca', 500);
    }
  }
}

module.exports = new UserService();