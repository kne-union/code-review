import { TEXT_EXTENSIONS, EXT_TO_LANGUAGE, CHUNK_SIZE } from './constants';

export const getExtension = filename => {
  if (filename.indexOf('.') === 0) {
    filename = filename.slice(1);
  }
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export const isTextFile = filename => {
  const ext = getExtension(filename);
  const name = filename.toLowerCase();
  if (!ext) {
    return true;
  }
  return TEXT_EXTENSIONS.has(ext) || name === 'dockerfile' || name === 'makefile';
};

export const getLanguage = filename => {
  const name = filename.toLowerCase();
  if (name === 'dockerfile') return 'docker';
  if (name === 'makefile') return 'makefile';
  const ext = getExtension(filename);
  return EXT_TO_LANGUAGE[ext] || 'text';
};

export const splitIntoChunks = (code, chunkSize = CHUNK_SIZE) => {
  const lines = code.split('\n');
  const chunks = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunkLines = lines.slice(i, i + chunkSize);
    const startLine = i + 1;
    chunks.push({
      code: chunkLines.join('\n'),
      startLine,
      lineCount: chunkLines.length
    });
  }
  return chunks;
};
