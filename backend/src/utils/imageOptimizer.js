const sharp = require('sharp');

function parseBase64(dataUri) {
  if (!dataUri || typeof dataUri !== 'string') return null;

  const matches = dataUri.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      buffer: Buffer.from(matches[2], 'base64')
    };
  }

  try {
    return {
      mimeType: 'image/jpeg',
      buffer: Buffer.from(dataUri, 'base64')
    };
  } catch (err) {
    return null;
  }
}

async function optimizeImage(input, options = {}) {
  if (!input) return '';

  let buffer;
  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (typeof input === 'string') {
    if (!input.startsWith('data:image/')) {
      if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('/')) {
        return input;
      }
    }

    const parsed = parseBase64(input);
    if (!parsed || !parsed.buffer) return input;
    buffer = parsed.buffer;
  } else {
    return input;
  }

  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    fit = 'inside'
  } = options;

  try {
    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit,
        withoutEnlargement: true
      })
      .webp({ quality })
      .toBuffer();

    return `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('[imageOptimizer] Erro ao otimizar imagem com sharp:', error.message);
    return typeof input === 'string' ? input : '';
  }
}

async function optimizeAvatar(input) {
  return optimizeImage(input, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 80,
    fit: 'cover'
  });
}

async function optimizeCover(input) {
  return optimizeImage(input, {
    maxWidth: 1200,
    maxHeight: 500,
    quality: 80,
    fit: 'inside'
  });
}

module.exports = {
  optimizeImage,
  optimizeAvatar,
  optimizeCover
};
