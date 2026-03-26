import { useMemo, memo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import style from './style.module.scss';

const CodeChunk = memo(({ code, language, startLine, maxLineNumber }) => {
  const lineNumberWidth = useMemo(() => {
    const digits = maxLineNumber.toString().length;
    const charWidth = 8;
    const padding = 32;
    return Math.max(50, digits * charWidth + padding);
  }, [maxLineNumber]);

  return (
    <div className={style.highlighter} style={{ '--line-number-width': `${lineNumberWidth}px` }}>
      <SyntaxHighlighter language={language} style={vs} showLineNumbers startingLineNumber={startLine} wrapLongLines>
        {code}
      </SyntaxHighlighter>
    </div>
  );
});

export default CodeChunk;
