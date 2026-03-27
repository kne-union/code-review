import { useMemo, useRef, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import CodeChunk from './CodeChunk';
import { splitIntoChunks } from './utils';
import style from './style.module.scss';

const VirtualizedCode = ({ code, language, onSelectionChange }) => {
  const chunks = useMemo(() => splitIntoChunks(code), [code]);
  const maxLineNumber = useMemo(() => {
    const lines = code.split('\n');
    return lines.length;
  }, [code]);
  const containerRef = useRef(null);

  // 获取选中的行列号
  const handleSelectionChange = useCallback(() => {
    if (!onSelectionChange) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      onSelectionChange(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      onSelectionChange(null);
      return;
    }

    // 查找起始和结束行的 data-line 属性
    const getLineInfo = node => {
      let current = node;
      while (current && current !== container) {
        if (current.dataset?.line) {
          return {
            line: parseInt(current.dataset.line, 10),
            element: current
          };
        }
        current = current.parentElement;
      }
      return null;
    };

    const startInfo = getLineInfo(range.startContainer);
    const endInfo = getLineInfo(range.endContainer);

    if (startInfo && endInfo) {
      // 计算列号：从1开始计数
      const getColumnInfo = (lineElement, container, offset) => {
        // 如果是文本节点，需要计算从行首到该位置的文本长度
        if (container.nodeType === Node.TEXT_NODE) {
          // 找到文本节点所在的行元素
          let textNode = container;
          let length = offset;

          // 向前遍历同一行内的所有兄弟节点，累加文本长度
          let prev = textNode.previousSibling;
          while (prev) {
            if (prev.nodeType === Node.TEXT_NODE) {
              length += prev.textContent.length;
            } else if (prev.nodeType === Node.ELEMENT_NODE) {
              length += prev.textContent.length;
            }
            prev = prev.previousSibling;
          }

          // 向上查找，累加父节点之前的兄弟节点的文本长度
          let parent = textNode.parentElement;
          while (parent && parent !== lineElement) {
            let prevParent = parent.previousSibling;
            while (prevParent) {
              if (prevParent.nodeType === Node.ELEMENT_NODE) {
                length += prevParent.textContent.length;
              } else if (prevParent.nodeType === Node.TEXT_NODE) {
                length += prevParent.textContent.length;
              }
              prevParent = prevParent.previousSibling;
            }
            parent = parent.parentElement;
          }

          return length + 1; // 列号从1开始
        }

        // 如果是元素节点，offset是子节点索引
        // 需要计算前offset个子节点的文本总长度
        let length = 0;
        for (let i = 0; i < offset && i < container.childNodes.length; i++) {
          const child = container.childNodes[i];
          length += child.textContent.length;
        }
        return length + 1; // 列号从1开始
      };

      onSelectionChange({
        startLine: startInfo.line,
        startColumn: getColumnInfo(startInfo.element, range.startContainer, range.startOffset),
        endLine: endInfo.line,
        endColumn: getColumnInfo(endInfo.element, range.endContainer, range.endOffset)
      });
    } else {
      onSelectionChange(null);
    }
  }, [onSelectionChange]);

  return (
    <div ref={containerRef} className={style['virtuoso-container']} style={{ height: '100%', width: '100%' }} onMouseUp={handleSelectionChange} onKeyUp={handleSelectionChange}>
      <Virtuoso
        style={{ height: '100%', width: '100%' }}
        totalCount={chunks.length}
        itemContent={index => {
          const chunk = chunks[index];
          return <CodeChunk code={chunk.code} language={language} startLine={chunk.startLine} maxLineNumber={maxLineNumber} />;
        }}
      />
    </div>
  );
};

export default VirtualizedCode;
