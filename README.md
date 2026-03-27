# code-review

### 描述

一个用于代码审查场景的 React 组件，提供文件树导航和代码预览功能，支持语法高亮、虚拟滚动和多格式文件预览

### 安装

```shell
npm i --save @kne/code-review
```

### 概述

一个功能强大的 React 组件，用于代码审查场景下的文件浏览和预览。支持树形文件导航、语法高亮、虚拟滚动和多种文件格式预览。

### 核心特性

- 📁 **树形文件导航** - 集成 `@kne/file-system-view`，支持多级目录结构展示，文件夹展开收起，文件类型图标识别
- 🎨 **语法高亮** - 基于 `react-syntax-highlighter`，支持 40+ 种编程语言的语法高亮显示，包括
  JavaScript、TypeScript、Python、Go、Rust 等
- ⚡ **虚拟滚动优化** - 使用 `react-virtuoso` 实现大文件虚拟滚动，支持万行代码流畅浏览，内存占用低
- 🖼️ **多格式文件预览** - 集成 `@kne/react-file`，支持图片、视频、音频、PDF、Office 文档等多种文件格式在线预览
- 🌐 **国际化支持** - 内置中英文支持，可通过 `@kne/react-intl` 扩展更多语言
- 📋 **智能行号显示** - 统一的行号列宽度计算，确保不同代码块行号对齐，支持大文件行号显示

### 适用场景

- 📝 **代码审查工具** - 在线查看和审查代码变更
- 📚 **文档系统** - 浏览项目文档和代码示例
- 🎓 **教学平台** - 展示教学代码和项目结构
- 🔍 **代码搜索工具** - 文件导航和代码预览
- 💼 **在线 IDE** - 轻量级代码浏览功能

## 浏览器支持

- Chrome 86+（推荐，支持 File System Access API）
- Edge 86+
- Firefox 78+
- Safari 14+

注意：File System Access API 仅在 Chrome 和 Edge 中完整支持，其他浏览器需要提供替代方案。


### 示例(全屏)

#### 示例代码

- 基础用法
- 使用静态数据展示文件树和代码预览的基本功能
- _CodeReview(@kne/current-lib_code-review)[import * as _CodeReview from "@kne/code-review"],(@kne/current-lib_code-review/dist/index.css),antd(antd),mockData(./doc/mockData.js)

```jsx
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

```

- 本地文件夹浏览
- 使用 File System Access API 选择本地文件夹，浏览目录结构并预览文件内容（仅支持 Chrome/Edge）
- _CodeReview(@kne/current-lib_code-review)[import * as _CodeReview from "@kne/code-review"],(@kne/current-lib_code-review/dist/index.css),antd(antd)

```jsx
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
          const path = parentPath ? parentPath + '/' + name : name;
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

```

- Ref 方法
- 通过 ref 获取当前选中的文件信息、代码选择区域行列号，以及内容容器元素
- _CodeReview(@kne/current-lib_code-review)[import * as _CodeReview from "@kne/code-review"],(@kne/current-lib_code-review/dist/index.css),antd(antd),mockData(./doc/mockData.js)

```jsx
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
      message.success(&#96;已获取选中文件: ${file.name}&#96;);
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
      message.success(&#96;已获取内容容器元素，宽度: ${element.offsetWidth}px&#96;);
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

```

### API

| 属性 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| data | `FileItem[]` | `[]` | 文件目录结构数据 |
| getFile | `(filePath: string) => Promise<File>` | - | 根据文件路径获取文件对象的函数 |

### Ref 方法

通过 `ref` 可以访问以下方法：

| 方法名 | 返回类型 | 描述 |
|--------|----------|------|
| getSelectedFile() | `{ path: string, name: string } \| null` | 获取当前选择的文件信息 |
| getSelection() | `{ startLine: number, startColumn: number, endLine: number, endColumn: number } \| null` | 获取当前选中的行列号 |
| getContentElement() | `HTMLElement \| null` | 获取代码内容容器元素 |

### FileItem

| 属性 | 类型 | 说明 |
|------|------|------|
| name | `string` | 文件或文件夹名称 |
| type | `'file' \| 'directory'` | 类型，文件夹需要有 children 或 type 为 'directory' |
| path | `string` | 文件路径 |
| children | `FileItem[]` | 子项列表（仅文件夹） |

### 使用示例

```jsx
import CodeReview from '@kne/code-review';

const fileData = [
  {
    name: 'src',
    type: 'directory',
    path: 'src',
    children: [
      { name: 'index.js', type: 'file', path: 'src/index.js' },
      { name: 'utils.js', type: 'file', path: 'src/utils.js' }
    ]
  }
];

const getFile = async (filePath) => {
  // 返回 File 对象
  return await fetch(filePath).then(res => res.blob());
};

<CodeReview data={fileData} getFile={getFile} />
```
