import { useState } from 'react';
import { useIntl } from '@kne/react-intl';
import { Splitter, Empty, Spin, Flex } from 'antd';
import FileSystemView from '@kne/file-system-view';
import Fetch from '@kne/react-fetch';
import { FilePreview } from '@kne/react-file';
import VirtualizedCode from './VirtualizedCode';
import withLocale from './withLocale';
import { isTextFile, isTextFileByContent, getLanguage } from './utils';
import style from './style.module.scss';
import '@kne/react-file/dist/index.css';
import '@kne/file-system-view/dist/index.css';

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
    const textFileCheck = isTextFile(selectedFile.name);
    const language = getLanguage(selectedFile.name);

    return (
      <Fetch
        key={selectedFile.path}
        params={{ filePath: selectedFile.path }}
        loader={async ({ params }) => {
          const file = await getFile(params.filePath);

          // 如果扩展名在白名单中，直接作为文本处理
          if (textFileCheck === true) {
            return { content: await file.text(), isText: true, file };
          }

          // 如果扩展名不在白名单中或没有扩展名，使用 TextDecoder 检测
          const isText = await isTextFileByContent(file);
          if (isText) {
            return { content: await file.text(), isText: true, file };
          } else {
            return { content: URL.createObjectURL(file), isText: false, file };
          }
        }}
        loading={<Spin className={style.loading} description={formatMessage({ id: 'loadingText' })} />}
        render={({ data }) =>
          data.isText ? (
            <VirtualizedCode code={data.content || ''} language={language} />
          ) : (
            <Flex vertical align="center" justify="center" flex={1}>
              <FilePreview src={data.content} filename={selectedFile.name} />
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
