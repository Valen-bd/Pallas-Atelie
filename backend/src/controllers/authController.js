const mongoose = require('mongoose');
const { Usuario, Artista, Empresa } = require('../models');
const { hashPassword, verifyPassword } = require('../utils/security');

const estadosBR = {
  'acre': 'AC', 'alagoas': 'AL', 'amapa': 'AP', 'amapá': 'AP', 'amazonas': 'AM',
  'bahia': 'BA', 'ceara': 'CE', 'ceará': 'CE', 'distrito federal': 'DF',
  'espirito santo': 'ES', 'espírito santo': 'ES', 'goias': 'GO', 'goiás': 'GO',
  'maranhao': 'MA', 'maranhão': 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
  'minas gerais': 'MG', 'para': 'PA', 'pará': 'PA', 'paraiba': 'PB', 'paraíba': 'PB',
  'parana': 'PR', 'paraná': 'PR', 'pernambuco': 'PE', 'piaui': 'PI', 'piauí': 'PI',
  'rio de janeiro': 'RJ', 'rio grande do norte': 'RN', 'rio grande do sul': 'RS',
  'rondonia': 'RO', 'rondônia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
  'sao paulo': 'SP', 'são paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO'
};

function normalizarUF(estado) {
  if (!estado) return 'SC';
  const clean = estado.trim().toLowerCase();
  if (estadosBR[clean]) return estadosBR[clean];
  if (estado.trim().length === 2) return estado.trim().toUpperCase();
  return estado.trim().slice(0, 2).toUpperCase();
}

// 1. Cadastrar Artista
async function cadastrarArtista(req, res) {
  try {
    const {
      nome,
      nome_artistico,
      email,
      cpf,
      fone,
      pais,
      estado,
      cidade,
      rua,
      numero,
      bairro,
      cep,
      tipo,
      senha,
      login: loginInformado
    } = req.body;

    // Validações básicas de preenchimento
    if (!nome || !email || !cpf || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome, E-mail, CPF e Senha são obrigatórios.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'CPF inválido. Deve conter exatamente 11 números.'
      });
    }

    // Verificar se e-mail de usuário ou CPF já existem
    const usuarioExistente = await Usuario.findOne({ email: cleanEmail });
    if (usuarioExistente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Este e-mail já está cadastrado no sistema.'
      });
    }

    const cpfExistente = await Artista.findOne({ cpf: cleanCpf });
    if (cpfExistente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Este CPF já está cadastrado.'
      });
    }

    // Gerar login único se não fornecido
    let baseLogin = (loginInformado || cleanEmail.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    let finalLogin = baseLogin;
    let contador = 1;
    while (await Usuario.findOne({ login: finalLogin })) {
      finalLogin = `${baseLogin}_${contador++}`;
    }

    // Processar tags de tipo de arte
    let tagsArte = [];
    if (Array.isArray(tipo)) {
      tagsArte = tipo;
    } else if (typeof tipo === 'string' && tipo.trim()) {
      tagsArte = tipo.split(',').map(t => t.trim()).filter(Boolean);
    }

    const cleanCep = (cep ? cep.replace(/\D/g, '') : '89201000').padEnd(8, '0').slice(0, 8);
    const ufNormalizada = normalizarUF(estado);

    // Criar o Usuário com hash da senha
    const novoUsuario = await Usuario.create({
      login: finalLogin,
      email: cleanEmail,
      senha_hash: hashPassword(senha),
      tipo_perfil: 'artista',
      ativo: true
    });

    // Criar o Artista associado
    const novoArtista = await Artista.create({
      usuario_id: novoUsuario._id,
      cpf: cleanCpf,
      nome: nome.trim(),
      nome_artistico: (nome_artistico || nome).trim(),
      email: cleanEmail,
      fone: fone ? fone.trim() : '',
      tipo_arte: tagsArte,
      endereco: {
        rua: (rua || 'Rua Principal').trim(),
        numero: (numero || 'S/N').trim(),
        bairro: (bairro || 'Centro').trim(),
        cidade: (cidade || 'Joinville').trim(),
        uf: ufNormalizada,
        cep: cleanCep,
        pais: (pais || 'Brasil').trim(),
        localizacao: {
          type: 'Point',
          coordinates: [-48.8456, -26.3045] // Coordenadas default
        }
      },
      portfolios: []
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Artista cadastrado com sucesso!',
      dados: {
        usuario_id: novoUsuario._id,
        artista_id: novoArtista._id,
        login: novoUsuario.login,
        nome: novoArtista.nome,
        nome_artistico: novoArtista.nome_artistico,
        email: novoArtista.email,
        tipo_perfil: 'artista'
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar artista:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao cadastrar artista: ' + error.message
    });
  }
}

// 2. Cadastrar Empresa
async function cadastrarEmpresa(req, res) {
  try {
    const {
      nome_empresa,
      razao_social,
      responsavel,
      email,
      cnpj,
      fone,
      pais,
      estado,
      cidade,
      rua,
      numero,
      bairro,
      cep,
      area,
      senha,
      login: loginInformado
    } = req.body;

    if (!nome_empresa || !razao_social || !responsavel || !email || !cnpj || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome Fantasia, Razão Social, Responsável, E-mail, CNPJ e Senha são obrigatórios.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'CNPJ inválido. Deve conter exatamente 14 números.'
      });
    }

    const usuarioExistente = await Usuario.findOne({ email: cleanEmail });
    if (usuarioExistente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Este e-mail já está cadastrado no sistema.'
      });
    }

    const cnpjExistente = await Empresa.findOne({ cnpj: cleanCnpj });
    if (cnpjExistente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Este CNPJ já está cadastrado.'
      });
    }

    let baseLogin = (loginInformado || cleanEmail.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    let finalLogin = baseLogin;
    let contador = 1;
    while (await Usuario.findOne({ login: finalLogin })) {
      finalLogin = `${baseLogin}_${contador++}`;
    }

    let tagsArte = [];
    if (Array.isArray(area)) {
      tagsArte = area;
    } else if (typeof area === 'string' && area.trim()) {
      tagsArte = area.split(',').map(t => t.trim()).filter(Boolean);
    }

    const cleanCep = (cep ? cep.replace(/\D/g, '') : '89201000').padEnd(8, '0').slice(0, 8);
    const ufNormalizada = normalizarUF(estado);

    const novoUsuario = await Usuario.create({
      login: finalLogin,
      email: cleanEmail,
      senha_hash: hashPassword(senha),
      tipo_perfil: 'empresa',
      ativo: true
    });

    const novaEmpresa = await Empresa.create({
      usuario_id: novoUsuario._id,
      cnpj: cleanCnpj,
      razao_social: razao_social.trim(),
      nome_fantasia: nome_empresa.trim(),
      responsavel: responsavel.trim(),
      email: cleanEmail,
      fone: fone ? fone.trim() : '',
      tipo_arte: tagsArte,
      endereco: {
        rua: (rua || 'Avenida Principal').trim(),
        numero: (numero || 'S/N').trim(),
        bairro: (bairro || 'Centro').trim(),
        cidade: (cidade || 'Joinville').trim(),
        uf: ufNormalizada,
        cep: cleanCep,
        pais: (pais || 'Brasil').trim(),
        localizacao: {
          type: 'Point',
          coordinates: [-48.8480, -26.3010]
        }
      },
      portfolios: []
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Empresa cadastrada com sucesso!',
      dados: {
        usuario_id: novoUsuario._id,
        empresa_id: novaEmpresa._id,
        login: novoUsuario.login,
        nome_fantasia: novaEmpresa.nome_fantasia,
        razao_social: novaEmpresa.razao_social,
        email: novaEmpresa.email,
        tipo_perfil: 'empresa'
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao cadastrar empresa: ' + error.message
    });
  }
}

// 3. Login de Usuário (Artista ou Empresa)
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'E-mail e senha são obrigatórios.'
      });
    }

    const cleanInput = email.trim().toLowerCase();
    const usuario = await Usuario.findOne({
      $or: [{ email: cleanInput }, { login: cleanInput }]
    });

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas.'
      });
    }

    // Validar senha
    const senhaValida = verifyPassword(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas.'
      });
    }

    // Carregar os dados do perfil correspondente
    let perfil = null;
    if (usuario.tipo_perfil === 'artista') {
      perfil = await Artista.findOne({ usuario_id: usuario._id });
    } else {
      perfil = await Empresa.findOne({ usuario_id: usuario._id });
    }

    return res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
      dados: {
        usuario_id: usuario._id,
        login: usuario.login,
        email: usuario.email,
        tipo_perfil: usuario.tipo_perfil,
        perfil: perfil
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao processar login: ' + error.message
    });
  }
}

module.exports = {
  cadastrarArtista,
  cadastrarEmpresa,
  login
};
