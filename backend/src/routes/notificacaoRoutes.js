const express = require('express');
const router = express.Router();
const { Notificacao, Artista, Empresa } = require('../models');

router.patch('/:usuarioId/visualizadas', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(usuarioId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de usuário inválido.' });
    }

    const notificacaoIds = req.body?.notificacaoIds;
    if (!Array.isArray(notificacaoIds) || notificacaoIds.some(id => !/^[0-9a-fA-F]{24}$/.test(id))) {
      return res.status(400).json({ sucesso: false, mensagem: 'Lista de notificações inválida.' });
    }

    if (notificacaoIds.length === 0) {
      return res.json({ sucesso: true });
    }

    await Notificacao.updateMany(
      { _id: { $in: notificacaoIds }, destinatario_id: usuarioId, lida_em: null },
      { $set: { lida_em: new Date() } }
    );

    return res.json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

router.get('/:usuarioId/nao-lidas', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(usuarioId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de usuário inválido.' });
    }

    const naoLidas = await Notificacao.countDocuments({ destinatario_id: usuarioId, lida_em: null });
    return res.json({ sucesso: true, nao_lidas: naoLidas });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

router.get('/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(usuarioId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de usuário inválido.' });
    }

    const notificacoes = await Notificacao.find({ destinatario_id: usuarioId })
      .populate('autor_id', 'login tipo_perfil')
      .populate('publicacao_id', 'usuario_id')
      .sort({ criado_em: -1 })
      .limit(100);

    const autorIds = [...new Set(notificacoes
      .map(item => item.autor_id?._id)
      .filter(Boolean)
      .map(String))];
    const [artistas, empresas] = await Promise.all([
      Artista.find({ usuario_id: { $in: autorIds } }).select('usuario_id nome nome_artistico avatar'),
      Empresa.find({ usuario_id: { $in: autorIds } }).select('usuario_id nome_fantasia razao_social avatar')
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

    const dados = notificacoes.map(notificacao => {
      const autorUsuario = notificacao.autor_id;
      const autorPerfil = autorUsuario ? perfis.get(String(autorUsuario._id)) : null;
      return {
        id: String(notificacao._id),
        tipo: notificacao.tipo,
        texto: notificacao.texto,
        criado_em: notificacao.criado_em,
        autor: autorPerfil?.nome || autorUsuario?.login || 'Usuário',
        autor_login: autorUsuario?.login ? `@${autorUsuario.login}` : '',
        avatar: autorPerfil?.avatar || '',
        perfil_id: String(autorUsuario?._id || ''),
        publicacao_id: String(notificacao.publicacao_id?._id || ''),
        destinatario_id: String(notificacao.destinatario_id)
      };
    });

    return res.json({ sucesso: true, dados });
  } catch (err) {
    return res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

module.exports = router;
