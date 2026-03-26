import { useState, useMemo, memo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { Splitter, Empty, Spin, Flex } from 'antd';
import FileSystemView from '@kne/file-system-view';
import Fetch from '@kne/react-fetch';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FilePreview } from '@kne/react-file';
import { Virtuoso } from 'react-virtuoso';
import '@kne/react-file/dist/index.css';
import '@kne/file-system-view/dist/index.css';
import style from './style.module.scss';

const TEXT_EXTENSIONS = new Set([
  'js',
  'mjs',
  'jsx',
  'ts',
  'tsx',
  'json',
  'css',
  'scss',
  'less',
  'html',
  'htm',
  'vue',
  'py',
  'java',
  'go',
  'rs',
  'md',
  'txt',
  'yaml',
  'yml',
  'xml',
  'sh',
  'bash',
  'sql',
  'graphql',
  'toml',
  'ini',
  'cfg',
  'conf',
  'env',
  'dockerfile',
  'makefile',
  'c',
  'cpp',
  'h',
  'hpp',
  'rb',
  'php',
  'swift',
  'kt',
  'scala',
  'lua',
  'r',
  'pl',
  'dart',
  'svelte',
  'log',
  'csv',
  'svg'
]);

const EXT_TO_LANGUAGE = {
  js: 'javascript',
  mjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'html',
  htm: 'html',
  vue: 'html',
  py: 'python',
  java: 'java',
  go: 'go',
  rs: 'rust',
  md: 'markdown',
  txt: 'text',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  sh: 'bash',
  bash: 'bash',
  sql: 'sql',
  graphql: 'graphql',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  lua: 'lua',
  r: 'r',
  pl: 'perl',
  dart: 'dart',
  svelte: 'svelte',
  toml: 'toml',
  ini: 'ini',
  log: 'text',
  csv: 'text',
  svg: 'xml'
};

const CHUNK_SIZE = 50;

const getExtension = filename => {
  if (filename.indexOf('.') === 0) {
    filename = filename.slice(1);
  }
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const isTextFile = filename => {
  const ext = getExtension(filename);
  const name = filename.toLowerCase();
  if (!ext) {
    return true;
  }
  return TEXT_EXTENSIONS.has(ext) || name === 'dockerfile' || name === 'makefile';
};

const getLanguage = filename => {
  const name = filename.toLowerCase();
  if (name === 'dockerfile') return 'docker';
  if (name === 'makefile') return 'makefile';
  const ext = getExtension(filename);
  return EXT_TO_LANGUAGE[ext] || 'text';
};

const splitIntoChunks = (code, chunkSize = CHUNK_SIZE) => {
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

const CodeReview = withLocale(({ data, getFile, ...props }) => {
  const { formatMessage } = useIntl();
  const [selectedFile, setSelectedFile] = useState(null);

  const renderContent = () => {
    if (!selectedFile) {
      return (
        <Flex vertical align="center" justify="center" flex={1}>
          <Empty description={formatMessage({ id: 'selectFile' })} />
        </Flex>
      );
    }
    const isText = isTextFile(selectedFile.name);
    const language = getLanguage(selectedFile.name);

    return (
      <Fetch
        key={selectedFile.path}
        params={{ filePath: selectedFile.path }}
        loader={async ({ params }) => {
          const file = await getFile(params.filePath);
          if (isText) {
            return await file.text();
          } else {
            return URL.createObjectURL(file);
          }
        }}
        loading={<Spin className={style.loading} tip={formatMessage({ id: 'loadingText' })} />}
        render={({ data }) =>
          isText ? (
            <VirtualizedCode code={data || ''} language={language} />
          ) : (
            <Flex vertical align="center" justify="center" flex={1}>
              <FilePreview src={data} filename={selectedFile.name} />
            </Flex>
          )
        }
      />
    );
  };

  return (
    <div className={style.container}>
      <Splitter style={{ flex: 1 }}>
        <Splitter.Pane min={200} defaultSize={300}>
          <div className={style.sidebar}>
            <FileSystemView data={data} onFileClick={setSelectedFile} selectedPath={selectedFile?.path} />
          </div>
        </Splitter.Pane>
        <Splitter.Pane min={400}>
          <div className={style.content}>{renderContent()}</div>
        </Splitter.Pane>
      </Splitter>
    </div>
  );
});

export default CodeReview;
