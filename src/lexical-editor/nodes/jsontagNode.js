import { $isElementNode, ElementNode } from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
import LexicalTheme from '../utils/theme';
import { isBlackedOutNode } from './blackoutNode';

/**
 * @class jsontag element node class
 */
export class JsontagNode extends ElementNode {
  /** @internal class name for this dom element*/
  __className;
  /** @internal jsontags for this element*/
  __tag;
  __uniqueId;
  __currentUser;

  static getType() {
    return 'jsontag';
  }

  static clone(node) {
    return new JsontagNode(node.__className, node.__tag, node.__uniqueId);
  }

  static setCurrentUser(_user) {
    JsontagNode.__currentUser = _user;
    return false;
  }

  constructor(className, tag, uniqueId, key) {
    super(key);
    this.__className = className;
    this.__tag = tag;
    this.__uniqueId = uniqueId;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'jsontag',
      className: this.__className,
      tag: this.__tag,
      uniqueId: this.__uniqueId,
      version: 1
    };
  }

  static importJSON(serializedNode) {
    const node = $createJsontagNode(serializedNode.className, serializedNode.tag, serializedNode.uniqueId);
    return node;
  }

  createDOM() {
    const span = document.createElement('span');
    if (isBlackedOutNode(this, JsontagNode.__currentUser)) {
      return span;
    }
    span.setAttribute('data-lexical-jsontag', 'true');
    span.setAttribute('data-lexical-text', 'true');
    span.setAttribute('data-tag', this.__tag);
    span.setAttribute('data-uniqueId', this.__uniqueId);
    addClassNamesToElement(span, LexicalTheme.jsontag);
    return span;
  }

  updateDOM(prevNode, dom) {
    const jsontagSpan = dom;
    jsontagSpan.setAttribute('data-tag', JSON.stringify(this.__tag));
    jsontagSpan.setAttribute('data-uniqueId', JSON.stringify(this.__uniqueId));
    return false;
  }

  exportDOM() {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-jsontag', 'true');
    element.setAttribute('data-tag', JSON.stringify(this.__tag));
    element.setAttribute('data-uniqueId', JSON.stringify(this.__uniqueId));
    return { element };
  }

  static importDOM() {
    return {
      span: (domNode) => {
        if (!domNode.hasAttribute('data-lexical-jsontag')) {
          return null;
        }
        return {
          conversion: convertJsontagElement,
          priority: 1
        };
      }
    };
  }

  isInline() {
    return true;
  }

  canMergeWith(sibling) {
    const node = this.getLatest();
    if (node.__uniqueId === sibling.__uniqueId) {
      return true;
    }
    return false;
  }

  insertNewAfter(selection) {
    const element = this.getParentOrThrow().insertNewAfter(selection);

    if ($isElementNode(element)) {
      const jsontagNode = $createJsontagNode(this.__className, this.__tag, this.__uniqueId);

      element?.append(jsontagNode);

      return jsontagNode;
    }
    return null;
  }

  canInsertTextBefore() {
    return false;
  }

  canInsertTextAfter() {
    return false;
  }
  excludeFromCopy() {
    return true;
  }
  canBeEmpty() {
    return false;
  }
  extractWithChild() {
    return true;
  }
}

function convertJsontagElement(domNode) {
  const { className, dataset } = domNode;
  const node = $createJsontagNode(className, JSON.parse(dataset.tag), JSON.parse(dataset.uniqueId));
  return {
    node
  };
}

export function $createJsontagNode(className, tag, uniqueId) {
  const jsontagNode = new JsontagNode(className, tag, uniqueId);
  return jsontagNode;
}

export function $isJsontagNode(node) {
  return node instanceof JsontagNode;
}
