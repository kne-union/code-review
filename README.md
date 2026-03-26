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

### API

| 属性 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| data | `FileItem[]` | `[]` | 文件目录结构数据 |
| getFile | `(filePath: string) => Promise<File>` | - | 根据文件路径获取文件对象的函数 |

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
