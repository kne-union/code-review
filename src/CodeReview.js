import { useState } from 'react';
import { useIntl } from '@kne/react-intl';
import { Splitter, Empty, Spin, Flex } from 'antd';
import FileSystemView from '@kne/file-system-view';
import Fetch from '@kne/react-fetch';
import { FilePreview } from '@kne/react-file';
import VirtualizedCode from './VirtualizedCode';
import withLocale from './withLocale';
import { isTextFile, getLanguage } from './utils';
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
