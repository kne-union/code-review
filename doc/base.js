const { default: CodeReview } = _CodeReview;
const { useState, useRef, useCallback } = React;
const { Button, Space, message } = antd;

const BaseExample = () => {
  const [fileTree, setFileTree] = useState(null);
  const rootHandleRef = useRef(null);

  const handleOpenFolder = useCallback(async () => {
    try {
      if (!window.showDirectoryPicker) {
        message.error('当前浏览器不支持文件系统访问 API，请使用 Chrome 或 Edge');
        return;
      }

      const dirHandle = await window.showDirectoryPicker();
      rootHandleRef.current = dirHandle;

      const collectKeys = async handle => {
        const keys = [];
        const iterator = handle.keys();
        let result = await iterator.next();
        while (!result.done) {
          keys.push(result.value);
          result = await iterator.next();
        }
        return keys;
      };

      const buildTree = async (handle, parentPath = '', depth = 0) => {
        const entries = [];
        if (depth > 10) return entries;

        const keys = await collectKeys(handle);
        for (const name of keys) {
          if (name === 'node_modules') continue;
          const path = parentPath ? `${parentPath}/${name}` : name;
          let isDirectory = false;
          try {
            const subDirHandle = await handle.getDirectoryHandle(name);
            isDirectory = true;
            const children = await buildTree(subDirHandle, path, depth + 1);
            entries.push({ name, type: 'directory', path, children });
          } catch (e) {
            // 不是目录
          }
          if (!isDirectory) {
            entries.push({ name, type: 'file', path });
          }
        }
        return entries;
      };

      const tree = await buildTree(dirHandle, '', 0);
      setFileTree(tree);
    } catch (e) {
      if (e.name !== 'AbortError') {
        message.error('打开文件夹失败: ' + e.message);
      }
    }
  }, []);

  const getFileByPath = useCallback(async filePath => {
    const rootHandle = rootHandleRef.current;
    if (!rootHandle) return null;

    const parts = filePath.split('/');
    let handle = rootHandle;
    for (let i = 0; i < parts.length - 1; i++) {
      handle = await handle.getDirectoryHandle(parts[i]);
    }
    return await handle.getFileHandle(parts[parts.length - 1]);
  }, []);

  const getFile = useCallback(
    async filePath => {
      const fileHandle = await getFileByPath(filePath);
      return await fileHandle.getFile();
    },
    [getFileByPath]
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button type="primary" onClick={handleOpenFolder}>
        选择本地文件夹
      </Button>
      {fileTree && (
        <div style={{ height: 600, border: '1px solid #f0f0f0' }}>
          <CodeReview data={fileTree} getFile={getFile} />
        </div>
      )}
    </Space>
  );
};

render(<BaseExample />);
