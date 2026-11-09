const express = require('express');
const router = express.Router();
const { Publicacao, Artista, Empresa, Usuario, Notificacao } = require('../models');
const { optimizeImage } = require('../utils/imageOptimizer');

// 1. Criar nova publicação
router.post('/', async (req, res) => {
  try {
    const { usuario_id, legenda, categoria = 'Portfólio', imagem } = req.body;

    if (!usuario_id || !usuario_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Autor da publicação não informado ou inválido.' });
    }

    if (!legenda && !imagem) {
      return res.status(400).json({ sucesso: false, mensagem: 'A publicação precisa ter texto ou imagem.' });
    }

    let imagemComprimida = '';
    if (imagem && imagem.startsWith('data:image/')) {
      imagemComprimida = await optimizeImage(imagem, { maxWidth: 1200, maxHeight: 900, quality: 80 });
    } else if (imagem) {
      imagemComprimida = imagem;
    }

    const novaPublicacao = await Publicacao.create({
      usuario_id,
      legenda: legenda || '',
      categoria: categoria || 'Portfólio',
      imagem: imagemComprimida
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Publicação criada com sucesso!',
      dados: novaPublicacao
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// 2. Feed geral de publicações (com autor, nome e foto de perfil reais do autor de cada post)
router.get('/feed', async (req, res) => {
  try {
    const { usuario_id: usuarioId } = req.query;
    if (usuarioId && !/^[0-9a-fA-F]{24}$/.test(usuarioId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de usuário inválido.' });
    }

    const publicacoes = await Publicacao.find()
      .populate('usuario_id', 'login tipo_perfil')
      .populate('comentarios.usuario_id', 'login')
      .sort({ criado_em: -1 })
      .limit(50);

    const postsFormatados = await Promise.all(
      publicacoes.map(async (p) => {
        const uId = p.usuario_id?._id || p.usuario_id;
        const tipo = p.usuario_id?.tipo_perfil || 'artista';

        let perfil = null;
        if (tipo === 'artista') {
          perfil = await Artista.findOne({ usuario_id: uId }).select('nome nome_artistico avatar');
        } else {
          perfil = await Empresa.findOne({ usuario_id: uId }).select('nome_fantasia razao_social avatar');
        }

        const autorNome = perfil?.nome_artistico || perfil?.nome || perfil?.nome_fantasia || p.usuario_id?.login || 'Artista';
        const autorAvatar = perfil?.avatar || '';
        const autorLogin = p.usuario_id?.login ? `@${p.usuario_id.login}` : '';

        return {
          id: String(p._id),
          usuario_id: String(uId),
          autor: autorNome,
          login: autorLogin,
          avatar: autorAvatar,
          initial: autorNome.charAt(0).toUpperCase() || 'U',
          caption: p.legenda,
          category: p.categoria,
          image: p.imagem,
          curtidasCount: p.curtidas ? p.curtidas.length : 0,
          likedByMe: usuarioId ? p.curtidas.some(id => String(id) === String(usuarioId)) : false,
          comments: (p.comentarios || []).map(comment => ({
            author: comment.autor || comment.usuario_id?.login || 'Usuário',
            text: comment.texto,
            createdAt: comment.criado_em
          })),
          criado_em: p.criado_em
        };
      })
    );

    return res.json({ sucesso: true, dados: postsFormatados });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

router.post('/:id/curtir', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id: usuarioId } = req.body;
    if (!/^[0-9a-fA-F]{24}$/.test(id) || !/^[0-9a-fA-F]{24}$/.test(usuarioId || '')) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID da publicação ou usuário inválido.' });
    }

    const [publicacao, usuario] = await Promise.all([
      Publicacao.findById(id),
      Usuario.findById(usuarioId).select('login tipo_perfil')
    ]);
    if (!publicacao) return res.status(404).json({ sucesso: false, mensagem: 'Publicação não encontrada.' });
    if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });

    const jaCurtiu = publicacao.curtidas.some(curtiuPor => String(curtiuPor) === String(usuarioId));
    if (jaCurtiu) {
      publicacao.curtidas.pull(usuarioId);
    } else {
      publicacao.curtidas.addToSet(usuarioId);
      if (String(publicacao.usuario_id) !== String(usuarioId)) {
        await Notificacao.create({
          destinatario_id: publicacao.usuario_id,
          autor_id: usuarioId,
          publicacao_id: publicacao._id,
          tipo: 'curtida'
        });
      }
    }

    await publicacao.save();
    return res.json({
      sucesso: true,
      dados: {
        curtido: !jaCurtiu,
        curtidasCount: publicacao.curtidas.length
      }
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

router.post('/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id: usuarioId, texto } = req.body;
    const comentario = typeof texto === 'string' ? texto.trim() : '';
    if (!/^[0-9a-fA-F]{24}$/.test(id) || !/^[0-9a-fA-F]{24}$/.test(usuarioId || '')) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID da publicação ou usuário inválido.' });
    }
    if (!comentario || comentario.length > 160) {
      return res.status(400).json({ sucesso: false, mensagem: 'O comentário deve ter entre 1 e 160 caracteres.' });
    }

    const [publicacao, usuario] = await Promise.all([
      Publicacao.findById(id),
      Usuario.findById(usuarioId).select('login tipo_perfil')
    ]);
    if (!publicacao) return res.status(404).json({ sucesso: false, mensagem: 'Publicação não encontrada.' });
    if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });

    let perfil = usuario.tipo_perfil === 'empresa'
      ? await Empresa.findOne({ usuario_id: usuarioId }).select('nome_fantasia razao_social')
      : await Artista.findOne({ usuario_id: usuarioId }).select('nome nome_artistico');
    const autor = perfil?.nome_artistico || perfil?.nome || perfil?.nome_fantasia
      || perfil?.razao_social || usuario.login || 'Usuário';

    publicacao.comentarios.push({ usuario_id: usuarioId, autor, texto: comentario });
    const novoComentario = publicacao.comentarios[publicacao.comentarios.length - 1];
    await publicacao.save();

    if (String(publicacao.usuario_id) !== String(usuarioId)) {
      await Notificacao.create({
        destinatario_id: publicacao.usuario_id,
        autor_id: usuarioId,
        publicacao_id: publicacao._id,
        tipo: 'comentario',
        texto: comentario
      });
    }

    return res.status(201).json({
      sucesso: true,
      dados: {
        id: String(novoComentario._id),
        author: autor,
        text: comentario,
        createdAt: novoComentario.criado_em
      }
    });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(usuarioId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de usuário inválido.' });
    }

    const [usuario, publicacoes] = await Promise.all([
      Usuario.findById(usuarioId).select('login tipo_perfil'),
      Publicacao.find({ usuario_id: usuarioId }).sort({ criado_em: -1 }).limit(20)
    ]);

    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    const perfil = usuario.tipo_perfil === 'empresa'
      ? await Empresa.findOne({ usuario_id: usuarioId }).select('nome_fantasia razao_social avatar')
      : await Artista.findOne({ usuario_id: usuarioId }).select('nome nome_artistico avatar');
    const autor = perfil?.nome_artistico || perfil?.nome || perfil?.nome_fantasia
      || perfil?.razao_social || usuario.login || 'Usuário';

    const dados = publicacoes.map(publicacao => ({
      id: String(publicacao._id),
      usuario_id: String(usuario._id),
      autor,
      avatar: perfil?.avatar || '',
      caption: publicacao.legenda,
      category: publicacao.categoria,
      image: publicacao.imagem,
      criado_em: publicacao.criado_em
    }));

    return res.json({ sucesso: true, dados });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// 3. Excluir publicação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;

    const post = await Publicacao.findById(id);
    if (!post) {
      return res.status(404).json({ sucesso: false, mensagem: 'Publicação não encontrada.' });
    }

    if (usuario_id && String(post.usuario_id) !== String(usuario_id)) {
      return res.status(403).json({ sucesso: false, mensagem: 'Você não tem permissão para excluir esta publicação.' });
    }

    await Publicacao.findByIdAndDelete(id);
    return res.json({ sucesso: true, mensagem: 'Publicação excluída com sucesso.' });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

module.exports = router;
