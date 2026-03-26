# API 文档

## CodeReview

用于代码审查的文件浏览器组件，提供文件树导航和代码预览功能。

### 属性

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

### 特性

- 📁 **树形文件导航** - 支持多级目录结构，清晰的层级展示
- 🎨 **语法高亮** - 支持 40+ 种编程语言的语法高亮显示
- ⚡ **虚拟滚动** - 大文件性能优化，支持万行代码流畅滚动
- 🖼️ **文件预览** - 支持图片、视频、音频、PDF 等多种文件格式预览
- 🌐 **国际化** - 内置中英文支持
- 📋 **行号显示** - 统一的行号列宽度，清晰的代码定位
