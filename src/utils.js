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
    return null; // 返回 null 表示未知类型，需要进一步检测
  }
  if (TEXT_EXTENSIONS.has(ext) || name === 'dockerfile' || name === 'makefile') {
    return true;
  }
  return null; // 不在白名单中，返回 null 表示需要进一步检测
};

export const isTextFileByContent = async file => {
  try {
    // 只读取前 512 字节进行检测，提高性能
    const chunk = file.slice(0, 512);
    const buffer = await chunk.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // 检查是否包含空字节，这是二进制文件的常见特征
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        return false;
      }
    }

    // 尝试使用 TextDecoder 解码
    const decoder = new TextDecoder('utf-8', { fatal: true });
    decoder.decode(buffer);
    return true;
  } catch (error) {
    return false;
  }
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
