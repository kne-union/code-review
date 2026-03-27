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
