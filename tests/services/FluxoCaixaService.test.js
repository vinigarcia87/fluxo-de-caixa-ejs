/**
 * Testes para FluxoCaixaService
 */

const FluxoCaixaService = require('../../src/services/FluxoCaixaService');
const { AppError } = require('../../src/utils/errorHandler');

// Mock dos modelos
jest.mock('../../models/ContaValor', () => ({
  ContaValor: jest.fn(),
  getAllContaValores: jest.fn(),
  getContaValorById: jest.fn(),
  getContaValoresByPeriodo: jest.fn(),
  addContaValor: jest.fn(),
  updateContaValor: jest.fn(),
  deleteContaValor: jest.fn(),
  getResumoFinanceiro: jest.fn()
}));

jest.mock('../../src/services/ContaService', () => ({
  getContaById: jest.fn(),
  isContaSaldoAnterior: jest.fn()
}));

const {
  getAllContaValores,
  getContaValorById,
  getContaValoresByPeriodo,
  addContaValor,
  updateContaValor,
  deleteContaValor,
  getResumoFinanceiro
} = require('../../models/ContaValor');

const ContaService = require('../../src/services/ContaService');

describe('FluxoCaixaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getResumoFinanceiro', () => {
    it('deve retornar resumo financeiro com sucesso', async () => {
      const resumoMock = {
        totalReceitas: 1000,
        totalDespesas: 600,
        saldoAtual: 400
      };

      getResumoFinanceiro.mockReturnValue(resumoMock);

      const resultado = await FluxoCaixaService.getResumoFinanceiro();

      expect(resultado).toEqual(resumoMock);
      expect(getResumoFinanceiro).toHaveBeenCalledTimes(1);
    });

    it('deve lançar AppError quando há erro interno', async () => {
      getResumoFinanceiro.mockImplementation(() => {
        throw new Error('Erro interno');
      });

      await expect(FluxoCaixaService.getResumoFinanceiro())
        .rejects
        .toThrow(AppError);
    });
  });

  describe('getUltimasMovimentacoes', () => {
    it('deve retornar últimas movimentações ordenadas por data', async () => {
      const movimentacoesMock = [
        { id: 1, data: new Date('2024-01-15'), valor: 100 },
        { id: 2, data: new Date('2024-01-10'), valor: 200 },
        { id: 3, data: new Date('2024-01-20'), valor: 300 }
      ];

      getAllContaValores.mockReturnValue(movimentacoesMock);

      const resultado = await FluxoCaixaService.getUltimasMovimentacoes(2);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].data.getTime()).toBeGreaterThan(resultado[1].data.getTime());
    });
  });

  describe('getMovimentacoesByPeriodo', () => {
    it('deve retornar movimentações do período especificado', async () => {
      const dataInicio = new Date('2024-01-01');
      const dataFim = new Date('2024-01-31');
      const movimentacoesMock = [
        { id: 1, data: new Date('2024-01-15'), valor: 100 }
      ];

      getContaValoresByPeriodo.mockReturnValue(movimentacoesMock);

      const resultado = await FluxoCaixaService.getMovimentacoesByPeriodo(dataInicio, dataFim);

      expect(resultado).toEqual(movimentacoesMock);
      expect(getContaValoresByPeriodo).toHaveBeenCalledWith(dataInicio, dataFim);
    });

    it('deve lançar erro quando datas são inválidas', async () => {
      await expect(
        FluxoCaixaService.getMovimentacoesByPeriodo(null, null)
      ).rejects.toThrow(AppError);
    });

    it('deve lançar erro quando data início é posterior à data fim', async () => {
      const dataInicio = new Date('2024-01-31');
      const dataFim = new Date('2024-01-01');

      await expect(
        FluxoCaixaService.getMovimentacoesByPeriodo(dataInicio, dataFim)
      ).rejects.toThrow(AppError);
    });
  });

  describe('getMovimentacaoById', () => {
    it('deve retornar movimentação quando encontrada', async () => {
      const movimentacaoMock = { id: 1, valor: 100 };
      getContaValorById.mockReturnValue(movimentacaoMock);

      const resultado = await FluxoCaixaService.getMovimentacaoById(1);

      expect(resultado).toEqual(movimentacaoMock);
    });

    it('deve lançar erro quando ID é inválido', async () => {
      await expect(
        FluxoCaixaService.getMovimentacaoById('invalid')
      ).rejects.toThrow(AppError);
    });

    it('deve lançar erro quando movimentação não é encontrada', async () => {
      getContaValorById.mockReturnValue(null);

      await expect(
        FluxoCaixaService.getMovimentacaoById(999)
      ).rejects.toThrow(AppError);
    });
  });

  describe('criarMovimentacao', () => {
    it('deve criar movimentação com sucesso', async () => {
      const dadosTest = testHelpers.createTestMovimentacao();
      const contaMock = { id: 1, nome: 'Teste' };
      const movimentacaoSalvaMock = { id: 1, ...dadosTest };

      ContaService.getContaById.mockResolvedValue(contaMock);
      ContaService.isContaSaldoAnterior.mockReturnValue(false);
      addContaValor.mockReturnValue(movimentacaoSalvaMock);

      const resultado = await FluxoCaixaService.criarMovimentacao(dadosTest);

      expect(resultado).toEqual(movimentacaoSalvaMock);
      expect(addContaValor).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando conta não é encontrada', async () => {
      const dadosTest = testHelpers.createTestMovimentacao();

      ContaService.getContaById.mockResolvedValue(null);

      await expect(
        FluxoCaixaService.criarMovimentacao(dadosTest)
      ).rejects.toThrow(AppError);
    });

    it('deve lançar erro quando tenta criar movimentação em conta de saldo anterior', async () => {
      const dadosTest = testHelpers.createTestMovimentacao();
      const contaMock = { id: 1, nome: 'Saldo Anterior' };

      ContaService.getContaById.mockResolvedValue(contaMock);
      ContaService.isContaSaldoAnterior.mockReturnValue(true);

      await expect(
        FluxoCaixaService.criarMovimentacao(dadosTest)
      ).rejects.toThrow(AppError);
    });

    it('deve lançar erro quando dados são inválidos', async () => {
      const dadosInvalidos = { contaId: '', data: '', valor: 0 };

      await expect(
        FluxoCaixaService.criarMovimentacao(dadosInvalidos)
      ).rejects.toThrow(AppError);
    });
  });

  describe('atualizarMovimentacao', () => {
    it('deve atualizar movimentação com sucesso', async () => {
      const dadosTest = testHelpers.createTestMovimentacao();
      const movimentacaoExistenteMock = { id: 1, valor: 50 };
      const contaMock = { id: 1, nome: 'Teste' };
      const movimentacaoAtualizadaMock = { id: 1, ...dadosTest };

      getContaValorById.mockReturnValue(movimentacaoExistenteMock);
      ContaService.getContaById.mockResolvedValue(contaMock);
      updateContaValor.mockReturnValue(movimentacaoAtualizadaMock);

      const resultado = await FluxoCaixaService.atualizarMovimentacao(1, dadosTest);

      expect(resultado).toEqual(movimentacaoAtualizadaMock);
      expect(updateContaValor).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe('deletarMovimentacao', () => {
    it('deve deletar movimentação com sucesso', async () => {
      const movimentacaoMock = { id: 1, valor: 100 };

      getContaValorById.mockReturnValue(movimentacaoMock);
      deleteContaValor.mockReturnValue(movimentacaoMock);

      const resultado = await FluxoCaixaService.deletarMovimentacao(1);

      expect(resultado).toEqual(movimentacaoMock);
      expect(deleteContaValor).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const movimentacaoMock = { id: 1, valor: 100 };

      getContaValorById.mockReturnValue(movimentacaoMock);
      deleteContaValor.mockReturnValue(null);

      await expect(
        FluxoCaixaService.deletarMovimentacao(1)
      ).rejects.toThrow(AppError);
    });
  });

  describe('getMovimentacoesComFiltros', () => {
    it('deve aplicar filtros corretamente', async () => {
      const movimentacoesMock = [
        {
          id: 1,
          data: new Date('2024-01-15'),
          conta: { id: 1, tipoConta: 'RECEITA' }
        },
        {
          id: 2,
          data: new Date('2024-01-10'),
          conta: { id: 2, tipoConta: 'DESPESA' }
        }
      ];

      getAllContaValores.mockReturnValue(movimentacoesMock);

      const filtros = {
        contaId: 1,
        tipoConta: 'RECEITA'
      };

      const resultado = await FluxoCaixaService.getMovimentacoesComFiltros(filtros);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].conta.id).toBe(1);
      expect(resultado[0].conta.tipoConta).toBe('RECEITA');
    });
  });
});