import { TextNode } from 'lexical';
import { isBlackedOutNode } from './blackoutNode';

export class CustomTextNode extends TextNode {
  static __currentUser;
  static getType() {
    return 'custom-text';
  }

  /**
   *
   * @param {CustomTextNode} node
   * @returns cloned node of existing node
   */
  static clone(node) {
    return new CustomTextNode(node.__text);
  }

  static getCurrentUser() {
    return CustomTextNode.__currentUser;
  }

  static setCurrentUser(user) {
    CustomTextNode.__currentUser = user;
    return false;
  }

  constructor(text, key) {
    super(text, key);
  }
  static importJSON(serializedNode) {
    const node = $createCustomTextNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'custom-text',
      version: 1
    };
  }

  createDOM(config) {
    const span = super.createDOM(config);
    if (isBlackedOutNode(this, CustomTextNode.getCurrentUser())) {
      span.innerText = '█'.repeat(10);
      // span.innerText = '█'.repeat(Math.floor(Math.random() * 11) + 5);
      // span.innerText = '█'.repeat(this.getTextContentSize());
    }
    return span;
  }

  updateDOM(prevNode, dom) {
    if (isBlackedOutNode(this, CustomTextNode.getCurrentUser())) {
      dom.innerText = '█'.repeat(10);
      // dom.innerText = '█'.repeat(Math.floor(Math.random() * 11) + 5);
      // dom.innerText = '█'.repeat(this.getTextContentSize());
    }
    return dom;
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

  // getTextContent() {
  //   if (isBlackedOutNode(this, CustomTextNode.getCurrentUser())) {
  //     return '*'.repeat(this.__text?.length);
  //   }
  //   return this.__text;
  // }
}

export function $createCustomTextNode(text) {
  return new CustomTextNode(text);
}

export function $isCustomTextNode(node) {
  return node instanceof CustomTextNode;
}
