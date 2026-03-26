import { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import CodeChunk from './CodeChunk';
import { splitIntoChunks } from './utils';

const VirtualizedCode = ({ code, language }) => {
  const chunks = useMemo(() => splitIntoChunks(code), [code]);
  const maxLineNumber = useMemo(() => {
    const lines = code.split('\n');
    return lines.length;
  }, [code]);

  return (
    <Virtuoso
      style={{ height: '100%', width: '100%' }}
      totalCount={chunks.length}
      itemContent={index => {
        const chunk = chunks[index];
        return <CodeChunk code={chunk.code} language={language} startLine={chunk.startLine} maxLineNumber={maxLineNumber} />;
      }}
    />
  );
};

export default VirtualizedCode;
