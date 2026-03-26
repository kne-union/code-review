const { default: CodeReview } = _CodeReview;
const { useCallback } = React;
const { mockFileData, mockFiles } = mockData;

const SimpleExample = () => {
  const getFile = useCallback(async (filePath) => {
    // 模拟文件获取
    const content = mockFiles[filePath];
    if (content) {
      return new File([content], filePath.split('/').pop(), {
        type: 'text/plain'
      });
    }
    throw new Error('File not found');
  }, []);

  return (
    <div style={{ height: 600, border: '1px solid #f0f0f0' }}>
      <CodeReview data={mockFileData} getFile={getFile} />
    </div>
  );
};

render(<SimpleExample />);
