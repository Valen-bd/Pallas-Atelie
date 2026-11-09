const express = require('express');
const router = express.Router();
const { Artista, Empresa, Oportunidade, Parceria, Usuario, Seguidor, Publicacao } = require('../models');
const { optimizeAvatar, optimizeCover } = require('../utils/imageOptimizer');

function toArray(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
  return [];
}

async function buildProfileUpdate(tipo, payload, perfilAtual) {
  const update = {};

  let processedAvatar = payload.avatar !== undefined ? String(payload.avatar || '').trim() : undefined;
  let processedCover = payload.cover !== undefined ? String(payload.cover || '').trim() : undefined;

  if (processedAvatar && processedAvatar.startsWith('data:image/')) {
    processedAvatar = await optimizeAvatar(processedAvatar);
  }
  if (processedCover && processedCover.startsWith('data:image/')) {
    processedCover = await optimizeCover(processedCover);
  }

  if (tipo === 'artista') {
    if (payload.nome) update.nome = String(payload.nome).trim();
    if (payload.nome_artistico !== undefined) update.nome_artistico = String(payload.nome_artistico || '').trim();
    if (payload.email) update.email = String(payload.email).trim().toLowerCase();
    if (payload.fone !== undefined) update.fone = String(payload.fone || '').trim();
    if (payload.bio !== undefined) update.bio = String(payload.bio || '').trim();
    if (processedAvatar !== undefined) update.avatar = processedAvatar;
    if (processedCover !== undefined) update.cover = processedCover;
    if (payload.arte !== undefined) update.tipo_arte = toArray(payload.arte);

    if (payload.pais || payload.estado || payload.cidade || payload.rua || payload.numero || payload.bairro || payload.cep) {
      update.endereco = {
        ...(perfilAtual?.endereco || {}),
        pais: payload.pais ? String(payload.pais).trim() : (perfilAtual?.endereco?.pais || 'Brasil'),
        uf: payload.estado ? String(payload.estado).trim().slice(0, 2).toUpperCase() : (perfilAtual?.endereco?.uf || 'SP'),
        cidade: payload.cidade ? String(payload.cidade).trim() : (perfilAtual?.endereco?.cidade || 'São Paulo'),
        rua: payload.rua ? String(payload.rua).trim() : (perfilAtual?.endereco?.rua || ''),
        numero: payload.numero ? String(payload.numero).trim() : (perfilAtual?.endereco?.numero || ''),
        bairro: payload.bairro ? String(payload.bairro).trim() : (perfilAtual?.endereco?.bairro || ''),
        cep: payload.cep ? String(payload.cep).replace(/\D/g, '').slice(0, 8) : (perfilAtual?.endereco?.cep || '')
      };
    }
  }

  if (tipo === 'empresa') {
    if (payload.nome_fantasia) update.nome_fantasia = String(payload.nome_fantasia).trim();
    if (payload.razao_social) update.razao_social = String(payload.razao_social).trim();
    if (payload.responsavel) update.responsavel = String(payload.responsavel).trim();
    if (payload.email) update.email = String(payload.email).trim().toLowerCase();
    if (payload.fone !== undefined) update.fone = String(payload.fone || '').trim();
    if (payload.bio !== undefined) update.bio = String(payload.bio || '').trim();
    if (processedAvatar !== undefined) update.avatar = processedAvatar;
    if (processedCover !== undefined) update.cover = processedCover;
    if (payload.arte !== undefined) update.tipo_arte = toArray(payload.arte);

    if (payload.pais || payload.estado || payload.cidade || payload.rua || payload.numero || payload.bairro || payload.cep) {
      update.endereco = {
        ...(perfilAtual?.endereco || {}),
        pais: payload.pais ? String(payload.pais).trim() : (perfilAtual?.endereco?.pais || 'Brasil'),
        uf: payload.estado ? String(payload.estado).trim().slice(0, 2).toUpperCase() : (perfilAtual?.endereco?.uf || 'SP'),
        cidade: payload.cidade ? String(payload.cidade).trim() : (perfilAtual?.endereco?.cidade || 'São Paulo'),
        rua: payload.rua ? String(payload.rua).trim() : (perfilAtual?.endereco?.rua || ''),
        numero: payload.numero ? String(payload.numero).trim() : (perfilAtual?.endereco?.numero || ''),
        bairro: payload.bairro ? String(payload.bairro).trim() : (perfilAtual?.endereco?.bairro || ''),
        cep: payload.cep ? String(payload.cep).replace(/\D/g, '').slice(0, 8) : (perfilAtual?.endereco?.cep || '')
      };
    }
  }

  return update;
}

router.get('/perfil/:tipo/:usuarioId', async (req, res) => {
  try {
    const { tipo, usuarioId } = req.params;
    const perfil = tipo === 'artista'
      ? await Artista.findOne({ usuario_id: usuarioId })
      : await Empresa.findOne({ usuario_id: usuarioId });

    if (!perfil) {
      return res.status(404).json({ sucesso: false, mensagem: 'Perfil não encontrado.' });
    }

    return res.json({ sucesso: true, dados: perfil });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

router.put('/perfil/:tipo/:usuarioId', async (req, res) => {
  try {
    const { tipo, usuarioId } = req.params;
    const payload = req.body || {};

    if (!['artista', 'empresa'].includes(tipo)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Tipo de perfil inválido.' });
    }

    const perfilAtual = tipo === 'artista'
      ? await Artista.findOne({ usuario_id: usuarioId })
      : await Empresa.findOne({ usuario_id: usuarioId });

    if (!perfilAtual) {
      return res.status(404).json({ sucesso: false, mensagem: 'Perfil não encontrado.' });
    }

    const update = await buildProfileUpdate(tipo, payload, perfilAtual);

    if (payload.usuario && payload.usuario.trim()) {
      await Usuario.findByIdAndUpdate(usuarioId, { login: String(payload.usuario).trim().replace(/^@/, '') });
    }

    const perfilAtualizado = tipo === 'artista'
      ? await Artista.findOneAndUpdate({ usuario_id: usuarioId }, update, { new: true })
      : await Empresa.findOneAndUpdate({ usuario_id: usuarioId }, update, { new: true });

    return res.json({
      sucesso: true,
      mensagem: 'Perfil atualizado com sucesso!',
      dados: perfilAtualizado
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Endpoint dedicado para compactar/otimizar qualquer imagem sob demanda
router.post('/imagens/otimizar', async (req, res) => {
  try {
    const { imagem, tipo = 'avatar' } = req.body;
    if (!imagem) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nenhuma imagem fornecida.' });
    }

    const otimizada = tipo === 'cover'
      ? await optimizeCover(imagem)
      : await optimizeAvatar(imagem);

    return res.json({
      sucesso: true,
      dados: {
        imagem: otimizada
      }
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Estatísticas reais (seguidores, seguindo, posts) de um usuário
router.get('/usuarios/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de usuário inválido.' });
    }

    const [seguidores, seguindo, posts] = await Promise.all([
      Seguidor.countDocuments({ seguido_id: id }),
      Seguidor.countDocuments({ seguidor_id: id }),
      Publicacao.countDocuments({ usuario_id: id })
    ]);

    return res.json({
      sucesso: true,
      dados: {
        seguidores,
        seguindo,
        posts
      }
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

router.get('/usuarios/:id/relacoes/:tipo', async (req, res) => {
  try {
    const { id, tipo } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de usuário inválido.' });
    }
    if (!['seguidores', 'seguindo'].includes(tipo)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Tipo de relação inválido.' });
    }

    const filtro = tipo === 'seguidores' ? { seguido_id: id } : { seguidor_id: id };
    const campoUsuario = tipo === 'seguidores' ? 'seguidor_id' : 'seguido_id';
    const relacoes = await Seguidor.find(filtro)
      .populate('seguidor_id', 'login tipo_perfil')
      .populate('seguido_id', 'login tipo_perfil')
      .sort({ criado_em: -1 });
    const usuarios = relacoes.map(relacao => relacao[campoUsuario]).filter(Boolean);
    const usuarioIds = [...new Set(usuarios.map(usuario => String(usuario._id)))];

    const [artistas, empresas] = await Promise.all([
      Artista.find({ usuario_id: { $in: usuarioIds } }).select('usuario_id nome nome_artistico avatar'),
      Empresa.find({ usuario_id: { $in: usuarioIds } }).select('usuario_id nome_fantasia razao_social avatar')
    ]);

    const perfis = new Map();
    artistas.forEach(perfil => perfis.set(String(perfil.usuario_id), {
      nome: perfil.nome_artistico || perfil.nome,
      avatar: perfil.avatar || ''
    }));
    empresas.forEach(perfil => perfis.set(String(perfil.usuario_id), {
      nome: perfil.nome_fantasia || perfil.razao_social,
      avatar: perfil.avatar || ''
    }));

    const dados = usuarios.map(usuario => {
      const perfil = perfis.get(String(usuario._id));
      return {
        id: String(usuario._id),
        nome: perfil?.nome || usuario.login || 'Usuário',
        login: usuario.login ? `@${usuario.login}` : '',
        avatar: perfil?.avatar || ''
      };
    });

    return res.json({ sucesso: true, dados });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Seguir ou deixar de seguir um perfil (Toggle)
router.post('/usuarios/:id/seguir', async (req, res) => {
  try {
    const seguidoId = req.params.id;
    const { seguidor_id: seguidorId } = req.body;

    if (!seguidorId || !seguidorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(401).json({ sucesso: false, mensagem: 'Usuário não autenticado.' });
    }

    if (String(seguidorId) === String(seguidoId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Você não pode seguir a si mesmo.' });
    }

    const relacaoExistente = await Seguidor.findOne({
      seguidor_id: seguidorId,
      seguido_id: seguidoId
    });

    let seguindo = false;
    if (relacaoExistente) {
      await Seguidor.findByIdAndDelete(relacaoExistente._id);
      seguindo = false;
    } else {
      await Seguidor.create({
        seguidor_id: seguidorId,
        seguido_id: seguidoId
      });
      seguindo = true;
    }

    const [totalSeguidores, totalSeguindo, totalPosts] = await Promise.all([
      Seguidor.countDocuments({ seguido_id: seguidoId }),
      Seguidor.countDocuments({ seguidor_id: seguidoId }),
      Publicacao.countDocuments({ usuario_id: seguidoId })
    ]);

    return res.json({
      sucesso: true,
      mensagem: seguindo ? 'Perfil seguido com sucesso!' : 'Deixou de seguir o perfil.',
      dados: {
        seguindo,
        totalSeguidores,
        totalSeguindo,
        totalPosts
      }
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Endpoint unificado para sugestões de perfis reais gravados no MongoDB
router.get('/sugestoes', async (req, res) => {
  try {
    const { exceto, q } = req.query;

    const filtro = {};
    if (exceto && exceto.match(/^[0-9a-fA-F]{24}$/)) {
      filtro.usuario_id = { $ne: exceto };
    }

    const termo = typeof q === 'string' ? q.trim().replace(/^@/, '').slice(0, 80) : '';
    if (termo) {
      const regexSeguro = new RegExp(termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const usuariosEncontrados = await Usuario.find({ login: regexSeguro }).select('_id');
      filtro.$or = [
        { nome: regexSeguro },
        { nome_artistico: regexSeguro },
        { nome_fantasia: regexSeguro },
        { razao_social: regexSeguro },
        { usuario_id: { $in: usuariosEncontrados.map(usuario => usuario._id) } }
      ];
    }

    const limite = termo ? 50 : 8;
    const [artistas, empresas] = await Promise.all([
      Artista.find(filtro)
        .populate('usuario_id', 'login')
        .sort({ criado_em: -1 })
        .limit(limite),
      Empresa.find(filtro)
        .populate('usuario_id', 'login')
        .sort({ criado_em: -1 })
        .limit(limite)
    ]);

    const formatados = [
      ...artistas.map(a => {
        const uId = a.usuario_id?._id || a.usuario_id || a._id;
        const nome = a.nome_artistico || a.nome || 'Artista';
        return {
          id: String(uId),
          tipo: 'Artista',
          nome,
          login: a.usuario_id?.login ? `@${a.usuario_id.login}` : `@${nome.toLowerCase().replace(/\s+/g, '')}`,
          avatar: a.avatar || '',
          bio: a.bio || 'Sem biografia informada.',
          cidade: a.endereco?.cidade || 'Não informada',
          estado: a.endereco?.uf || 'BR',
          area: (a.tipo_arte && a.tipo_arte.length > 0) ? a.tipo_arte.join(', ') : 'Artes Visuais'
        };
      }),
      ...empresas.map(e => {
        const uId = e.usuario_id?._id || e.usuario_id || e._id;
        const nome = e.nome_fantasia || e.razao_social || 'Empresa';
        return {
          id: String(uId),
          tipo: 'Empresa',
          nome,
          login: e.usuario_id?.login ? `@${e.usuario_id.login}` : `@${nome.toLowerCase().replace(/\s+/g, '')}`,
          avatar: e.avatar || '',
          bio: e.bio || 'Sem biografia informada.',
          cidade: e.endereco?.cidade || 'Não informada',
          estado: e.endereco?.uf || 'BR',
          area: (e.tipo_arte && e.tipo_arte.length > 0) ? e.tipo_arte.join(', ') : 'Artes Visuais'
        };
      })
    ];

    return res.json({ sucesso: true, dados: formatados });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Endpoint para obter dados públicos de um perfil (Artista ou Empresa) por ID com contadores reais
router.get('/perfil-publico/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_logado: usuarioLogado } = req.query;

    let query = {};
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: id }, { usuario_id: id }] };
    } else {
      query = { nome: id };
    }

    let perfil = await Artista.findOne(query).populate('usuario_id', 'login');
    let tipo = 'Artista';

    if (!perfil) {
      perfil = await Empresa.findOne(query).populate('usuario_id', 'login');
      tipo = 'Empresa';
    }

    if (!perfil) {
      return res.status(404).json({ sucesso: false, mensagem: 'Perfil não encontrado.' });
    }

    const targetUserId = perfil.usuario_id?._id || perfil.usuario_id || perfil._id;

    const [seguidoresCount, seguindoCount, postsCount, jaSegue] = await Promise.all([
      Seguidor.countDocuments({ seguido_id: targetUserId }),
      Seguidor.countDocuments({ seguidor_id: targetUserId }),
      Publicacao.countDocuments({ usuario_id: targetUserId }),
      (usuarioLogado && usuarioLogado.match(/^[0-9a-fA-F]{24}$/))
        ? Seguidor.exists({ seguidor_id: usuarioLogado, seguido_id: targetUserId })
        : Promise.resolve(null)
    ]);

    return res.json({
      sucesso: true,
      tipo,
      dados: perfil,
      stats: {
        seguidores: seguidoresCount,
        seguindo: seguindoCount,
        posts: postsCount,
        jaSegue: Boolean(jaSegue)
      }
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Listar todos os artistas cadastrados
router.get('/artistas', async (req, res) => {
  try {
    const artistas = await Artista.find().sort({ criado_em: -1 });
    res.json({ sucesso: true, dados: artistas });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Listar todas as empresas cadastradas
router.get('/empresas', async (req, res) => {
  try {
    const empresas = await Empresa.find().sort({ criado_em: -1 });
    res.json({ sucesso: true, dados: empresas });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Listar todas as oportunidades abertas
router.get('/oportunidades', async (req, res) => {
  try {
    const oportunidades = await Oportunidade.find({ status: 'aberta' })
      .populate('empresa_id', 'nome_fantasia razao_social endereco email')
      .sort({ data_publicacao: -1 });
    res.json({ sucesso: true, dados: oportunidades });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

module.exports = router;
