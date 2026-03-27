import { useState, useImperativeHandle, forwardRef, useRef, useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import { Splitter, Empty, Spin, Flex, Segmented } from 'antd';
import { CodeOutlined, EyeOutlined } from '@ant-design/icons';
import FileSystemView from '@kne/file-system-view';
import Fetch from '@kne/react-fetch';
import { FilePreview } from '@kne/react-file';
import VirtualizedCode from './VirtualizedCode';
import withLocale from './withLocale';
import { isTextFile, isTextFileByContent, getLanguage } from './utils';
import classnames from 'classnames';
import style from './style.module.scss';
import '@kne/react-file/dist/index.css';
import '@kne/file-system-view/dist/index.css';

const PREVIEW_MODES = {
  CODE: 'code',
  PREVIEW: 'preview'
};

const CodeReview = withLocale(
  forwardRef(({ data, getFile, ...props }, ref) => {
    const { formatMessage } = useIntl();
    const [selectedFile, setSelectedFile] = useState(null);
    const [selection, setSelection] = useState(null);
    const [previewMode, setPreviewMode] = useState(PREVIEW_MODES.CODE);
    const contentRef = useRef(null);

    useImperativeHandle(ref, () => ({
      /**
       * 获取当前选择的文件信息
       * @returns {{ path: string, name: string } | null}
       */
      getSelectedFile: () => selectedFile,
      /**
       * 获取当前选中的行列号
       * @returns {{ startLine: number, startColumn: number, endLine: number, endColumn: number } | null}
       */
      getSelection: () => selection,
      /**
       * 获取代码内容容器元素
       * @returns {HTMLElement | null}
       */
      getContentElement: () => contentRef.current
    }));

    // 判断文件是否支持预览模式切换（md 和 svg 文件）
    const supportsPreviewSwitch = useMemo(() => {
      if (!selectedFile) return false;
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      return ['md', 'svg', 'json'].indexOf(ext) > -1;
    }, [selectedFile]);

    // 当切换文件时，重置预览模式为代码模式
    const handleFileSelect = file => {
      setSelectedFile(file);
      setPreviewMode(PREVIEW_MODES.CODE);
    };

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

      const handleSelectionChange = newSelection => {
        setSelection(newSelection);
      };

      return (
        <Fetch
          key={selectedFile.path}
          params={{ filePath: selectedFile.path, previewMode }}
          loader={async ({ params }) => {
            const file = await getFile(params.filePath);
            // 如果扩展名不在白名单中或没有扩展名，使用 TextDecoder 检测
            const isText = textFileCheck === true || (await isTextFileByContent(file));
            if ((supportsPreviewSwitch && params.previewMode === PREVIEW_MODES.PREVIEW) || !isText) {
              return { content: URL.createObjectURL(file), isText: false, file };
            } else {
              return { content: await file.text(), isText: true, file };
            }
          }}
          loading={<Spin className={style.loading} description={formatMessage({ id: 'loadingText' })} />}
          render={({ data }) => {
            // 默认使用代码视图
            return data.isText ? (
              <VirtualizedCode code={data.content || ''} language={language} onSelectionChange={handleSelectionChange} />
            ) : (
              <Flex
                vertical
                align="center"
                justify="center"
                flex={1}
                className={classnames(style.preview, {
                  [style['supports-switch']]: supportsPreviewSwitch
                })}
              >
                <FilePreview src={data.content} filename={selectedFile.name} theme="light" />
              </Flex>
            );
          }}
        />
      );
    };

    return (
      <div className={style.container}>
        <Splitter style={{ flex: 1 }}>
          <Splitter.Pane min={200} defaultSize={300}>
            <div className={style.sidebar}>
              <FileSystemView data={data} onFileClick={handleFileSelect} selectedPath={selectedFile?.path} />
            </div>
          </Splitter.Pane>
          <Splitter.Pane min={400}>
            {supportsPreviewSwitch && (
              <div className={style['preview-switch']}>
                <Segmented
                  size="small"
                  value={previewMode}
                  onChange={value => setPreviewMode(value)}
                  options={[
                    { label: <CodeOutlined />, value: PREVIEW_MODES.CODE },
                    { label: <EyeOutlined />, value: PREVIEW_MODES.PREVIEW }
                  ]}
                />
              </div>
            )}
            <div className={style.content} ref={contentRef}>
              {renderContent()}
            </div>
          </Splitter.Pane>
        </Splitter>
      </div>
    );
  })
);

export default CodeReview;
