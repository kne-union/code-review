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
 * 创建行号 transformer
 * @param {number} startLine - 起始行号
 * @param {number} lineNumberWidth - 行号宽度
 * @returns {Object} Shiki transformer
 */
const createLineNumbersTransformer = (startLine, lineNumberWidth) => ({
  name: 'line-numbers',
  pre(node) {
    node.properties.style = 'margin:0;padding:0;background:transparent;';
    node.properties.class = 'shiki-pre';
  },
  code(node) {
    node.properties.style = 'padding:0;background:transparent;';
  },
  line(node, lineIndex) {
    const lineNumber = lineIndex + startLine - 1;
    node.properties['data-line'] = lineNumber;

    // 保存原始子元素
    const originalChildren = [...node.children];

    // 创建行号元素
    const lineNumberElement = {
      type: 'element',
      tagName: 'span',
      properties: {
        class: 'line-number',
        style: `flex-shrink:0;display:inline-block;width:${lineNumberWidth}px;padding:0 16px;text-align:right;color:#8c959f;font-size:13px;line-height:1.6;user-select:none;background:#fafbfc;box-sizing:border-box;border-right:1px solid #e1e4e8;`,
        'aria-hidden': 'true'
      },
      children: [
        {
          type: 'text',
          value: String(lineNumber)
        }
      ]
    };

    // 创建代码内容包装器
    const codeWrapper = {
      type: 'element',
      tagName: 'span',
      properties: {
        class: 'line-content',
        style: 'flex:1;padding:0 12px;'
      },
      children: originalChildren
    };

    // 让每行使用 flex 布局，设置行号和代码
    node.properties.style = 'display:flex;line-height:1.6;';
    node.children = [lineNumberElement, codeWrapper];
  }
});

/**
 * 使用 Shiki 高亮代码（带原生行号）
 * @param {string} code - 源代码
 * @param {string} language - 语言标识
 * @param {number} startLine - 起始行号
 * @param {number} lineNumberWidth - 行号宽度
 * @returns {Promise<{html: string, startLine: number, lineCount: number}>}
 */
export const highlightCode = async (code, language, startLine = 1, lineNumberWidth = 50) => {
  const lineCount = code.split('\n').length;

  try {
    // 预加载高亮器
    await ensureHighlighter();

    const html = await codeToHtml(code, {
      lang: normalizeLanguage(language),
      theme: SHIKI_THEME,
      transformers: [createLineNumbersTransformer(startLine, lineNumberWidth)]
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
