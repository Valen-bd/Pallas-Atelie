const mongoose = require('mongoose');
const {
  Usuario,
  Artista,
  Empresa,
  Oportunidade,
  Candidatura,
  Parceria
} = require('../models');

async function seedData() {
  console.log('🔄 Iniciando limpeza e população do banco de dados (SEED)...');

  // Limpar coleções existentes
  await Promise.all([
    Usuario.deleteMany({}),
    Artista.deleteMany({}),
    Empresa.deleteMany({}),
    Oportunidade.deleteMany({}),
    Candidatura.deleteMany({}),
    Parceria.deleteMany({})
  ]);

  console.log('🧹 Coleções limpas com sucesso.');

  // 1. Criar Usuários
  const usuarios = await Usuario.create([
    {
      login: 'clarice_pinturas',
      email: 'clarice.auth@pallas.com',
      senha_hash: '$2b$12$e80yqN3q5pE5c9Z8n9jV0.VwX61zC3P3S6K2m0v7T1aB9c0dE1f2G', // senha exemplo hash
      tipo_perfil: 'artista',
      ativo: true
    },
    {
      login: 'thiago_esculturas',
      email: 'thiago.auth@pallas.com',
      senha_hash: '$2b$12$K8yqN3q5pE5c9Z8n9jV0.VwX61zC3P3S6K2m0v7T1aB9c0dE3h4I',
      tipo_perfil: 'artista',
      ativo: true
    },
    {
      login: 'studio_art',
      email: 'admin@studioart.com.br',
      senha_hash: '$2b$12$L9zqN3q5pE5c9Z8n9jV0.VwX61zC3P3S6K2m0v7T1aB9c0dE5j6K',
      tipo_perfil: 'empresa',
      ativo: true
    },
    {
      login: 'techcorp_cultural',
      email: 'projetos@techcorp.com.br',
      senha_hash: '$2b$12$M0aqN3q5pE5c9Z8n9jV0.VwX61zC3P3S6K2m0v7T1aB9c0dE7l8M',
      tipo_perfil: 'empresa',
      ativo: true
    }
  ]);

  console.log(`✅ ${usuarios.length} usuários criados.`);

  // 2. Criar Artistas vinculados aos usuários
  const [artistaClarice, artistaThiago] = await Artista.create([
    {
      usuario_id: usuarios[0]._id,
      cpf: '12345678901',
      nome: 'Clarice Silva dos Santos',
      nome_artistico: 'Clarice Arte Viva',
      email: 'contato@claricearte.com.br',
      fone: '47999887766',
      link: 'https://instagram.com/claricearte',
      obs: 'Artista visual especializada em muralismo urbano contemporâneo e aquarela.',
      tipo_arte: ['Muralismo', 'Pintura em Tela', 'Aquarela'],
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
          coordinates: [-48.8456, -26.3045] // [longitude, latitude] Joinville/SC
        }
      },
      portfolios: [
        {
          cod_port: 1,
          tema: 'Murais Urbanos de Santa Catarina',
          descricao: 'Pinturas murais em larga escala para espaços públicos e fachadas comerciais.',
          imagens: [
            'https://cdn.pallas.com/artistas/clarice/mural_centro_01.webp',
            'https://cdn.pallas.com/artistas/clarice/mural_centro_02.webp'
          ],
          data_atualizacao: new Date('2026-10-10T10:00:00Z')
        },
        {
          cod_port: 2,
          tema: 'Série Natureza em Aquarela',
          descricao: 'Quadros botânicos em aquarela sobre papel algodão 300g.',
          imagens: [
            'https://cdn.pallas.com/artistas/clarice/aquarela_orquideas.webp'
          ],
          data_atualizacao: new Date('2026-09-28T18:20:00Z')
        }
      ]
    },
    {
      usuario_id: usuarios[1]._id,
      cpf: '98765432100',
      nome: 'Thiago Oliveira Castro',
      nome_artistico: 'Thiago Castro Esculturas',
      email: 'thiago@castroarte.com.br',
      fone: '48988776655',
      link: 'https://thiagocastro.art.br',
      obs: 'Escultor em metal, resina e madeira sustentável para projetos arquitetônicos.',
      tipo_arte: ['Escultura', 'Instalação Artística', 'Modelagem 3D'],
      endereco: {
        rua: 'Avenida Beira Mar Norte',
        numero: '1500',
        bairro: 'Agronômica',
        cidade: 'Florianópolis',
        uf: 'SC',
        cep: '88025200',
        pais: 'Brasil',
        localizacao: {
          type: 'Point',
          coordinates: [-48.5480, -27.5954] // Florianópolis/SC
        }
      },
      portfolios: [
        {
          cod_port: 1,
          tema: 'Formas Orgânicas em Aço Corten',
          descricao: 'Esculturas de grande porte para jardins e áreas abertas.',
          imagens: [
            'https://cdn.pallas.com/artistas/thiago/aco_corten_01.webp'
          ],
          data_atualizacao: new Date('2026-10-05T14:00:00Z')
        }
      ]
    }
  ]);

  console.log('✅ 2 artistas criados.');

  // 3. Criar Empresas vinculadas aos usuários
  const [empresaStudioArt, empresaTechCorp] = await Empresa.create([
    {
      usuario_id: usuarios[2]._id,
      cnpj: '12345678000199',
      razao_social: 'Galeria & Design Criativo Ltda',
      nome_fantasia: 'Studio Art & Co',
      responsavel: 'Marcos Vinicius Ribeiro',
      email: 'talentos@artandco.com.br',
      fone: '4734332211',
      link: 'https://artandco.com.br',
      obs: 'Agência de inovação visual especializada em ambientação artística e eventos.',
      tipo_arte: ['Muralismo', 'Cenografia', 'Escultura'],
      endereco: {
        rua: 'Avenida Coronel Procópio Gomes',
        numero: '1100',
        bairro: 'Bucarein',
        cidade: 'Joinville',
        uf: 'SC',
        cep: '89202100',
        pais: 'Brasil',
        localizacao: {
          type: 'Point',
          coordinates: [-48.8480, -26.3010] // Joinville/SC
        }
      },
      portfolios: [
        {
          cod_port: 1,
          tema: 'Projetos Corporativos 2026',
          descricao: 'Intervenções artísticas desenvolvidas em sedes de empresas.',
          imagens: [
            'https://cdn.pallas.com/empresas/artandco/hall_tech_hub.webp'
          ],
          data_atualizacao: new Date('2026-10-01T09:15:00Z')
        }
      ]
    },
    {
      usuario_id: usuarios[3]._id,
      cnpj: '98765432000188',
      razao_social: 'TechCorp Tecnologia e Inovação S/A',
      nome_fantasia: 'TechCorp Brasil',
      responsavel: 'Fernanda Albuquerque',
      email: 'sustentabilidade@techcorp.com.br',
      fone: '4730258000',
      link: 'https://techcorp.com.br',
      obs: 'Multinacional de tecnologia apoiando projetos de cultura e arte digital.',
      tipo_arte: ['Arte Digital', 'Instalação Artística'],
      endereco: {
        rua: 'Rua São Paulo',
        numero: '800',
        bairro: 'Victor Konder',
        cidade: 'Blumenau',
        uf: 'SC',
        cep: '89012001',
        pais: 'Brasil',
        localizacao: {
          type: 'Point',
          coordinates: [-49.0661, -26.9194] // Blumenau/SC
        }
      },
      portfolios: []
    }
  ]);

  console.log('✅ 2 empresas criadas.');

  // 4. Criar Oportunidades vinculadas a Empresas
  const [oportunidadeMural, oportunidadeEscultura, oportunidadeDigital] = await Oportunidade.create([
    {
      empresa_id: empresaStudioArt._id,
      cargo: 'Artista Muralista para Fachada Principal',
      funcao: 'Criação e execução de pintura mural em fachada de 60m², valorizando a identidade cultural da região.',
      salario: mongoose.Types.Decimal128.fromString('8500.00'),
      horario: 'Flexível (Previsão de 15 dias de execução)',
      tipo_arte: ['Muralismo', 'Grafite'],
      status: 'aberta',
      data_publicacao: new Date()
    },
    {
      empresa_id: empresaStudioArt._id,
      cargo: 'Escultor para Espaço de Coworking Criativo',
      funcao: 'Desenvolvimento de escultura suspensa conceitual para o átrio central.',
      salario: mongoose.Types.Decimal128.fromString('12000.00'),
      horario: 'Por etapa / entrega de projeto',
      tipo_arte: ['Escultura', 'Instalação Artística'],
      status: 'em_analise',
      data_publicacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      empresa_id: empresaTechCorp._id,
      cargo: 'Artista Digital para Instalação Imersiva',
      funcao: 'Desenvolvimento de ilustrações e projeções mapeadas interativas para convenção anual.',
      salario: mongoose.Types.Decimal128.fromString('6000.00'),
      horario: 'Remoto com 2 ensaios presenciais',
      tipo_arte: ['Arte Digital', 'Instalação Artística'],
      status: 'aberta',
      data_publicacao: new Date()
    }
  ]);

  console.log('✅ 3 oportunidades criadas.');

  // 5. Criar Candidaturas (Melhoria 1: Processo Seletivo)
  const candidaturas = await Candidatura.create([
    {
      oportunidade_id: oportunidadeMural._id,
      artista_id: artistaClarice._id,
      mensagem: 'Olá! Tenho vasta experiência em murais externos com tintas resistentes a intempéries. Meu portfólio demonstra trabalhos similares.',
      status: 'em_analise'
    },
    {
      oportunidade_id: oportunidadeEscultura._id,
      artista_id: artistaThiago._id,
      mensagem: 'Possuo materiais adequados para esculturas suspensas e laudo estrutural de fixação.',
      status: 'aprovado'
    }
  ]);

  console.log(`✅ ${candidaturas.length} candidaturas registradas.`);

  // 6. Criar Parcerias (Acordo Empresa ↔ Artista e Artista ↔ Artista N:N)
  const parcerias = await Parceria.create([
    {
      projeto: 'Escultura Suspensa Átrio Central',
      objetivo: 'Confecção e instalação da escultura artística suspensa no átrio da Studio Art & Co.',
      artistas_ids: [artistaThiago._id],
      empresa_id: empresaStudioArt._id,
      oportunidade_id: oportunidadeEscultura._id,
      status: 'ativa',
      data_inicio: new Date('2026-10-20'),
      data_fim: new Date('2026-11-20')
    },
    {
      projeto: 'Exposição Coletiva: Convergência Visual',
      objetivo: 'Parceria autônoma entre artistas combinando telas em aquarela e esculturas em resina para galeria comunitária.',
      artistas_ids: [artistaClarice._id, artistaThiago._id],
      empresa_id: null, // Parceria Artista ↔ Artista (sem empresa)
      oportunidade_id: null,
      status: 'em_negociacao',
      data_inicio: new Date('2026-11-01'),
      data_fim: new Date('2026-12-15')
    }
  ]);

  console.log(`✅ ${parcerias.length} parcerias consolidadas.`);
  console.log('✨ Seed concluído com sucesso!');

  return {
    usuarios: usuarios.length,
    artistas: 2,
    empresas: 2,
    oportunidades: 3,
    candidaturas: candidaturas.length,
    parcerias: parcerias.length
  };
}

// Execução direta via node seed.js
if (require.main === module) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
  const connectDB = require('../config/database');

  connectDB()
    .then(async () => {
      await seedData();
      console.log('Fechando conexão...');
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro ao executar seed:', err);
      process.exit(1);
    });
}

module.exports = seedData;
