import { codeToHtml } from 'shiki';
import { SHIKI_THEME, SHIKI_LANGUAGES, LANGUAGE_ALIASES } from './constants';

let highlighterPromise = null;

/**
 * 预加载 Shiki 高亮器（单例模式）
 */
const ensureHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(shiki =>
      shiki.createHighlighter({
        themes: [SHIKI_THEME],
        langs: SHIKI_LANGUAGES
      })
    );
  }
  return highlighterPromise;
};

/**
 * 规范化语言名称
 * @param {string} lang - 原始语言标识
 * @returns {string} 规范化后的语言名称
 */
const normalizeLanguage = lang => {
  if (!lang) return 'text';
  const lowerLang = lang.toLowerCase();
  return LANGUAGE_ALIASES[lowerLang] || lowerLang || 'text';
};

/**
 * 转义 HTML 特殊字符
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
const escapeHtml = text => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * 使用 Shiki 高亮代码
 * @param {string} code - 源代码
 * @param {string} language - 语言标识
 * @param {number} startLine - 起始行号
 * @returns {Promise<{html: string, startLine: number, lineCount: number}>}
 */
export const highlightCode = async (code, language, startLine = 1) => {
  const lineCount = code.split('\n').length;

  try {
    // 预加载高亮器
    await ensureHighlighter();

    const html = await codeToHtml(code, {
      lang: normalizeLanguage(language),
      theme: SHIKI_THEME,
      transformers: [
        {
          pre(node) {
            node.properties.style = 'margin:0;padding:0;background:transparent;';
          },
          line(node, lineIndex) {
            node.properties['data-line'] = lineIndex + startLine - 1;
          }
        }
      ]
    });

    return { html, startLine, lineCount };
  } catch (error) {
    console.error('Shiki highlight error:', error);
    // 降级处理：返回纯文本
    const escapedCode = escapeHtml(code);
    return {
      html: `<pre style="margin:0;padding:12px;background:#ffffff;"><code>${escapedCode}</code></pre>`,
      startLine,
      lineCount
    };
  }
};
