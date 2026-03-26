import { useState } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { Splitter, Empty, Spin, Flex } from 'antd';
import FileSystemView from '@kne/file-system-view';
import Fetch from '@kne/react-fetch';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FilePreview } from '@kne/react-file';
import style from './style.module.scss';

const TEXT_EXTENSIONS = new Set([
  'js',
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

const getExtension = filename => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const isTextFile = filename => {
  const ext = getExtension(filename);
  const name = filename.toLowerCase();
  return TEXT_EXTENSIONS.has(ext) || name === 'dockerfile' || name === 'makefile';
};

const getLanguage = filename => {
  const name = filename.toLowerCase();
  if (name === 'dockerfile') return 'docker';
  if (name === 'makefile') return 'makefile';
  const ext = getExtension(filename);
  return EXT_TO_LANGUAGE[ext] || 'text';
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
            <SyntaxHighlighter language={language} style={vs} showLineNumbers className={style.highlighter}>
              {data || ''}
            </SyntaxHighlighter>
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
            <FileSystemView {...props} data={data} onFileClick={setSelectedFile} />
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
