const { default: CodeReview } = _CodeReview;
const { useState, useRef, useCallback } = React;
const { Card, Descriptions, Button, Space, message, Alert } = antd;
const { mockFileData, mockFiles } = mockData;

const RefMethodsExample = () => {
  const codeReviewRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selection, setSelection] = useState(null);

  const getFile = useCallback(async (filePath) => {
    const content = mockFiles[filePath];
    if (content) {
      return new File([content], filePath.split('/').pop(), {
        type: 'text/plain'
      });
    }
    throw new Error('File not found');
  }, []);

  const handleGetSelectedFile = () => {
    if (!codeReviewRef.current) {
      message.warning('组件未就绪');
      return;
    }
    const file = codeReviewRef.current.getSelectedFile();
    if (file) {
      setSelectedFile(file);
      message.success(`已获取选中文件: ${file.name}`);
    } else {
      message.info('当前没有选中任何文件');
    }
  };

  const handleGetSelection = () => {
    if (!codeReviewRef.current) {
      message.warning('组件未就绪');
      return;
    }
    const sel = codeReviewRef.current.getSelection();
    if (sel) {
      setSelection(sel);
      message.success('已获取选中区域信息');
    } else {
      message.info('当前没有选中任何代码区域');
    }
  };

  const handleGetContentElement = () => {
    if (!codeReviewRef.current) {
      message.warning('组件未就绪');
      return;
    }
    const element = codeReviewRef.current.getContentElement();
    if (element) {
      message.success(`已获取内容容器元素，宽度: ${element.offsetWidth}px`);
    } else {
      message.warning('内容容器元素不存在');
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="使用说明"
        description="点击左侧文件树选择文件，在代码区域选择文本，然后使用下方按钮获取相关信息。"
        type="info"
        showIcon
      />
      
      <Space wrap>
        <Button type="primary" onClick={handleGetSelectedFile}>
          获取选中文件
        </Button>
        <Button onClick={handleGetSelection}>
          获取代码选择区域
        </Button>
        <Button onClick={handleGetContentElement}>
          获取内容容器
        </Button>
      </Space>

      {selectedFile && (
        <Card title="当前选中文件" size="small">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="文件名">{selectedFile.name}</Descriptions.Item>
            <Descriptions.Item label="路径">{selectedFile.path}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {selection && (
        <Card title="代码选择区域" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="起始行">{selection.startLine}</Descriptions.Item>
            <Descriptions.Item label="起始列">{selection.startColumn}</Descriptions.Item>
            <Descriptions.Item label="结束行">{selection.endLine}</Descriptions.Item>
            <Descriptions.Item label="结束列">{selection.endColumn}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <div style={{ height: 500, border: '1px solid #f0f0f0' }}>
        <CodeReview 
          ref={codeReviewRef} 
          data={mockFileData} 
          getFile={getFile} 
        />
      </div>
    </Space>
  );
};

render(<RefMethodsExample />);
