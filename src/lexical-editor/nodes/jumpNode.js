import { $applyNodeReplacement, TextNode } from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
import LexicalTheme from 'lexical-editor/utils/theme';

export class JumpNode extends TextNode {
  /** @internal class name for this dom element*/
  __className;
  /** @internal unique id  for this jump === id of dom node*/
  __uniqueId;
  /** @internal level for this node ['LEVEL1', 'LEVEL2', 'LEVEL3']*/
  __level;
  static getType() {
    return 'jump-text';
  }

  /**
   *
   * @param {JumpNode} node
   * @returns cloned node of existing node
   */
  static clone(node) {
    return new JumpNode(node.__text, node.__uniqueId, node.__level);
  }

  getLevel() {
    const node = this.getLatest();
    return node.__level;
  }

  getUniqueId() {
    const node = this.getLatest();
    return node.__uniqueId;
  }

  constructor(text, uniqueId, level, key) {
    super(text, key);
    this.__uniqueId = uniqueId;
    this.__level = level;
  }

  static importJSON(serializedNode) {
    const node = $createJumpNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    node.__uniqueId = serializedNode.uniqueId;
    node.__level = serializedNode.level;
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      uniqueId: this.__uniqueId,
      level: this.__level,
      type: 'jump-text',
      version: 1
    };
  }

  createDOM(config) {
    const span = super.createDOM(config);
    span.id = this.__uniqueId;
    span.setAttribute('data-lexical-jump', 'true');
    span.setAttribute('data-uniqueid', this.__uniqueId);
    span.setAttribute('data-level', this.__level);
    addClassNamesToElement(span, LexicalTheme.jump);
    return span;
  }

  updateDOM(prevNode, dom) {
    dom.id = this.__uniqueId;
    return dom;
  }

  exportDOM() {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-jump', 'true');
    element.setAttribute('data-uniqueid', this.__uniqueId);
    element.setAttribute('data-level', this.__level);
    return { element };
  }

  static importDOM() {
    return {
      span: (domNode) => {
        if (!domNode.hasAttribute('data-lexical-jump')) {
          return null;
        }
        return {
          conversion: convertJumpElement,
          priority: 1
        };
      }
    };
  }

  canInsertTextBefore() {
    return true;
  }

  canInsertTextAfter() {
    return true;
  }

  isTextEntity() {
    return true;
  }
}

function convertJumpElement(domNode) {
  const { dataset, innerText } = domNode;
  const node = $createJumpNode(innerText, dataset.uniqueid, dataset.level);
  return {
    node
  };
}

export function $createJumpNode(text, uniqueId, level) {
  const jumpNode = new JumpNode(text, uniqueId, level);
  return $applyNodeReplacement(jumpNode);
}

export function $isJumpNode(node) {
  return node instanceof JumpNode;
}
