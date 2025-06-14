const modelo = require('../modelo.js');
const bd = require('../bd/bd_utils.js');

beforeEach(() => {
  bd.reconfig('./bd/esmforum-teste.db');
  bd.exec('delete from perguntas', []);
  bd.exec('delete from respostas', []);
});

test('Testando banco de dados vazio', () => {
  expect(modelo.listar_perguntas().length).toBe(0);
});

test('Testando cadastro de três perguntas', () => {
  modelo.cadastrar_pergunta('1 + 1 = ?');
  modelo.cadastrar_pergunta('2 + 2 = ?');
  modelo.cadastrar_pergunta('3 + 3 = ?');
  const perguntas = modelo.listar_perguntas(); 
  expect(perguntas.length).toBe(3);
  expect(perguntas[0].texto).toBe('1 + 1 = ?');
  expect(perguntas[1].texto).toBe('2 + 2 = ?');
  expect(perguntas[2].num_respostas).toBe(0);
  expect(perguntas[1].id_pergunta).toBe(perguntas[2].id_pergunta-1);
});

// NOVOS TESTES PARA COBERTURA 100%

test('Testando cadastrar_resposta, get_pergunta, get_respostas e get_num_respostas', () => {
  const idPergunta = modelo.cadastrar_pergunta('Quanto é 5 + 5?');
  
  // Cadastrar respostas
  const idResposta1 = modelo.cadastrar_resposta(idPergunta, '10');
  const idResposta2 = modelo.cadastrar_resposta(idPergunta, 'Dez');
  expect(idResposta1).toBeDefined();
  expect(idResposta2).toBeDefined();

  // Buscar pergunta
  const pergunta = modelo.get_pergunta(idPergunta);
  expect(pergunta).toBeDefined();
  expect(pergunta.texto).toBe('Quanto é 5 + 5?');

  // Buscar respostas
  const respostas = modelo.get_respostas(idPergunta);
  expect(respostas.length).toBe(2);
  expect(respostas.some(r => r.texto === '10')).toBe(true);
  expect(respostas.some(r => r.texto === 'Dez')).toBe(true);

  // Buscar número de respostas
  const numRespostas = modelo.get_num_respostas(idPergunta);
  expect(numRespostas).toBe(2);
});

test('Testando reconfig_bd para substituir bd', () => {
  const mockBd = {
    queryAll: jest.fn().mockReturnValue([]),
    exec: jest.fn(),
    query: jest.fn().mockReturnValue({ 'count(*)': 0 }),
  };
  modelo.reconfig_bd(mockBd);

  // Testar que a função listar_perguntas usa o mock
  const perguntas = modelo.listar_perguntas();
  expect(mockBd.queryAll).toHaveBeenCalled();

  // Testar que cadastrar_pergunta chama exec no mock
  mockBd.exec.mockReturnValueOnce({ lastInsertRowid: 42 });
  const id = modelo.cadastrar_pergunta('Texto');
  expect(id).toBe(42);
  expect(mockBd.exec).toHaveBeenCalled();

  // Restaurar bd original para não afetar outros testes (opcional)
  modelo.reconfig_bd(require('../bd/bd_utils.js'));
});
