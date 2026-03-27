import { useMemo, memo, useEffect, useState } from 'react';
import { highlightCode } from './shiki-highlighter';
import style from './style.module.scss';

// 固定行高 (13px * 1.6)
const LINE_HEIGHT = 20.8;

const CodeChunk = memo(({ code, language, startLine, maxLineNumber }) => {
  const [html, setHtml] = useState('');
  const [lineCount, setLineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 预估行数，用于 loading 时占位
  const estimatedLines = useMemo(() => code.split('\n').length, [code]);

  const lineNumberWidth = useMemo(() => {
    const digits = maxLineNumber.toString().length;
    const charWidth = 8;
    const padding = 32;
    return Math.max(50, digits * charWidth + padding);
  }, [maxLineNumber]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    highlightCode(code, language, startLine).then(result => {
      if (isMounted) {
        setHtml(result.html);
        setLineCount(result.lineCount);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [code, language, startLine]);

  if (loading) {
    // 返回占位元素，保持预估高度，避免 Virtuoso 报 zero-sized 警告
    return (
      <div
        className={style['shiki-container']}
        style={{
          '--line-number-width': `${lineNumberWidth}px`,
          minHeight: estimatedLines * LINE_HEIGHT
        }}
      />
    );
  }

  return (
    <div className={style['shiki-container']} style={{ '--line-number-width': `${lineNumberWidth}px` }}>
      <div className={style['shiki-content']}>
        <div className={style['line-numbers']} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className={style['line-number']}>
              {startLine + i}
            </div>
          ))}
        </div>
        <div className={style['code-content']} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
});

export default CodeChunk;
