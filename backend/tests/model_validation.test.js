/**
 * Bateria de Testes de Integridade de Dados e Modelos Mongoose
 * Plataforma Pallas Ateliê
 */

const mongoose = require('mongoose');
const {
  Usuario,
  Artista,
  Empresa,
  Oportunidade,
  Candidatura,
  Parceria
} = require('../src/models');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failedTests++;
  }
}

async function validateDoc(doc) {
  try {
    await doc.validate();
    return null;
  } catch (error) {
    return error;
  }
}

async function runValidationTests() {
  console.log('\n======================================================');
  console.log('🧪 INICIANDO BATERIA DE TESTES DE VALIDAÇÃO DOS MODELOS');
  console.log('======================================================\n');

  // TESTE 1: Modelo Usuario
  console.log('--- Testando Modelo: Usuario ---');
  {
    const validUser = new Usuario({
      login: 'clarice_arte',
      email: 'clarice@teste.com',
      senha_hash: 'hash_super_secreto',
      tipo_perfil: 'artista'
    });
    const errValid = await validateDoc(validUser);
    assert(!errValid, 'Criação de usuário válido com perfil artista');

    const invalidUserShortLogin = new Usuario({
      login: 'cl',
      email: 'clarice@teste.com',
      senha_hash: 'hash',
      tipo_perfil: 'artista'
    });
    const errShort = await validateDoc(invalidUserShortLogin);
    assert(errShort && errShort.errors.login, 'Rejeição de login com menos de 3 caracteres');

    const invalidEmail = new Usuario({
      login: 'clarice',
      email: 'email_invalido_sem_arroba',
      senha_hash: 'hash',
      tipo_perfil: 'artista'
    });
    const errEmail = await validateDoc(invalidEmail);
    assert(errEmail && errEmail.errors.email, 'Rejeição de formato de e-mail inválido');

    const invalidPerfil = new Usuario({
      login: 'clarice',
      email: 'clarice@teste.com',
      senha_hash: 'hash',
      tipo_perfil: 'administrador_invalido'
    });
    const errPerfil = await validateDoc(invalidPerfil);
    assert(errPerfil && errPerfil.errors.tipo_perfil, 'Rejeição de perfil diferente de artista ou empresa');
  }

  // TESTE 2: Modelo Artista
  console.log('\n--- Testando Modelo: Artista ---');
  {
    const validArtista = new Artista({
      usuario_id: new mongoose.Types.ObjectId(),
      cpf: '12345678901',
      nome: 'Artista de Teste',
      email: 'contato@artista.com',
      tipo_arte: ['Muralismo', 'Aquarela'],
      endereco: {
        rua: 'Rua das Palmeiras',
        numero: '250',
        bairro: 'Centro',
        cidade: 'Joinville',
        uf: 'SC',
        cep: '89201000',
        pais: 'Brasil',
        localizacao: {
          type: 'Point',
          coordinates: [-48.8456, -26.3045]
        }
      },
      portfolios: [
        {
          cod_port: 1,
          tema: 'Portfolio 1',
          descricao: 'Descrição do portfólio',
          imagens: ['https://cdn.pallas.com/foto1.jpg']
        }
      ]
    });
    const errValidArtista = await validateDoc(validArtista);
    assert(!errValidArtista, 'Criação de artista com endereço GeoJSON e portfólio embutido');

    const invalidCPF = new Artista({
      usuario_id: new mongoose.Types.ObjectId(),
      cpf: '12345',
      nome: 'Artista',
      email: 'a@a.com',
      endereco: { rua: 'R', numero: '1', bairro: 'B', cidade: 'C', uf: 'SC', cep: '89201000' }
    });
    const errCPF = await validateDoc(invalidCPF);
    assert(errCPF && errCPF.errors.cpf, 'Rejeição de CPF com formato/tamanho incorreto');

    const invalidCEP = new Artista({
      usuario_id: new mongoose.Types.ObjectId(),
      cpf: '12345678901',
      nome: 'Artista',
      email: 'a@a.com',
      endereco: { rua: 'R', numero: '1', bairro: 'B', cidade: 'C', uf: 'SC', cep: '8920-00' }
    });
    const errCEP = await validateDoc(invalidCEP);
    assert(errCEP && errCEP.errors['endereco.cep'], 'Rejeição de CEP com máscara ou quantidade incorreta de dígitos');
  }

  // TESTE 3: Modelo Empresa
  console.log('\n--- Testando Modelo: Empresa ---');
  {
    const validEmpresa = new Empresa({
      usuario_id: new mongoose.Types.ObjectId(),
      cnpj: '12345678000199',
      razao_social: 'Empresa Teste Ltda',
      nome_fantasia: 'Empresa Teste',
      responsavel: 'Fulano da Silva',
      email: 'contato@empresa.com',
      tipo_arte: ['Cenografia'],
      endereco: {
        rua: 'Rua B',
        numero: '200',
        bairro: 'Distrito Industrial',
        cidade: 'Joinville',
        uf: 'SC',
        cep: '89219000',
        pais: 'Brasil',
        localizacao: {
          type: 'Point',
          coordinates: [-48.8480, -26.3010]
        }
      }
    });
    const errValidEmpresa = await validateDoc(validEmpresa);
    assert(!errValidEmpresa, 'Criação de empresa com dados corporativos e endereço GeoJSON');

    const invalidCNPJ = new Empresa({
      usuario_id: new mongoose.Types.ObjectId(),
      cnpj: '123456',
      razao_social: 'Razao',
      nome_fantasia: 'Fantasia',
      responsavel: 'Resp',
      email: 'empresa@teste.com'
    });
    const errCNPJ = await validateDoc(invalidCNPJ);
    assert(errCNPJ && errCNPJ.errors.cnpj, 'Rejeição de CNPJ fora do padrão de 14 dígitos');
  }

  // TESTE 4: Modelo Oportunidade
  console.log('\n--- Testando Modelo: Oportunidade ---');
  {
    const validOportunidade = new Oportunidade({
      empresa_id: new mongoose.Types.ObjectId(),
      cargo: 'Pintor Muralista',
      funcao: 'Pintura de fachada externa',
      salario: mongoose.Types.Decimal128.fromString('5000.00'),
      tipo_arte: ['Muralismo'],
      status: 'aberta'
    });
    const errOportunidade = await validateDoc(validOportunidade);
    assert(!errOportunidade, 'Criação de oportunidade com Decimal128 e status aberto');

    const invalidStatusOportunidade = new Oportunidade({
      empresa_id: new mongoose.Types.ObjectId(),
      cargo: 'Pintor',
      funcao: 'Funcao',
      status: 'status_desconhecido'
    });
    const errStatus = await validateDoc(invalidStatusOportunidade);
    assert(errStatus && errStatus.errors.status, 'Rejeição de status não permitido em oportunidade');
  }

  // TESTE 5: Modelo Candidatura (Melhoria 1)
  console.log('\n--- Testando Modelo: Candidatura (Melhoria 1) ---');
  {
    const validCandidatura = new Candidatura({
      oportunidade_id: new mongoose.Types.ObjectId(),
      artista_id: new mongoose.Types.ObjectId(),
      mensagem: 'Tenho interesse na vaga',
      status: 'inscrito'
    });
    const errCandidatura = await validateDoc(validCandidatura);
    assert(!errCandidatura, 'Criação de candidatura de artista vinculada a oportunidade');

    const missingFieldsCandidatura = new Candidatura({});
    const errMissing = await validateDoc(missingFieldsCandidatura);
    assert(
      errMissing && errMissing.errors.oportunidade_id && errMissing.errors.artista_id,
      'Exigência obrigatória de oportunidade_id e artista_id'
    );
  }

  // TESTE 6: Modelo Parceria
  console.log('\n--- Testando Modelo: Parceria ---');
  {
    const artista1Id = new mongoose.Types.ObjectId();
    const artista2Id = new mongoose.Types.ObjectId();

    const parceriaEntreArtistas = new Parceria({
      projeto: 'Mural Compartilhado',
      objetivo: 'Criar mural conjunto',
      artistas_ids: [artista1Id, artista2Id],
      status: 'em_negociacao'
    });
    const errParceria1 = await validateDoc(parceriaEntreArtistas);
    assert(!errParceria1, 'Criação de parceria N:N entre múltiplos artistas (sem empresa obrigatória)');

    const invalidParceriaSemArtistas = new Parceria({
      projeto: 'Projeto Solo Vazio',
      objetivo: 'Objetivo',
      artistas_ids: []
    });
    const errSemArtistas = await validateDoc(invalidParceriaSemArtistas);
    assert(errSemArtistas && errSemArtistas.errors.artistas_ids, 'Rejeição de parceria sem artistas associados');
  }

  console.log('\n======================================================');
  console.log(`📊 RESULTADO FINAL: ${passedTests} APROVADOS | ${failedTests} FALHAS`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runValidationTests()
  .then(() => {
    console.log('✨ Todos os testes de validação dos modelos foram concluídos com sucesso!');
  })
  .catch((err) => {
    console.error('Erro nos testes:', err);
    process.exit(1);
  });
