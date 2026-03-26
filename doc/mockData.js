// 模拟文件目录结构数据
export const mockFileData = [
  {
    name: 'src',
    type: 'directory',
    path: 'src',
    children: [
      {
        name: 'components',
        type: 'directory',
        path: 'src/components',
        children: [
          { name: 'Button.js', type: 'file', path: 'src/components/Button.js' },
          { name: 'Input.js', type: 'file', path: 'src/components/Input.js' },
          { name: 'Modal.js', type: 'file', path: 'src/components/Modal.js' }
        ]
      },
      { name: 'index.js', type: 'file', path: 'src/index.js' },
      { name: 'utils.js', type: 'file', path: 'src/utils.js' }
    ]
  },
  { name: 'package.json', type: 'file', path: 'package.json' },
  { name: 'README.md', type: 'file', path: 'README.md' }
];

// 模拟文件内容
export const mockFiles = {
  'src/index.js': `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`,
  'src/utils.js': `export const formatDate = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};`,
  'src/components/Button.js': `import React from 'react';
import './Button.css';

const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;`,
  'src/components/Input.js': `import React, { useState } from 'react';

const Input = ({ placeholder, onChange, type = 'text' }) => {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default Input;`,
  'src/components/Modal.js': `import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;`,
  'package.json': `{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
  'README.md': `# My App

这是一个示例 React 应用。

## 安装

\`\`\`bash
npm install
\`\`\`

## 运行

\`\`\`bash
npm start
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`
`
};
