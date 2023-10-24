import { $applyNodeReplacement, ElementNode } from "lexical";

/**
 * @class black-out element node class
 */
export class BlackOutNode extends ElementNode {
  /** @internal class name for this dom element*/
  __className;
  __users;
  __currentUser;

  static getType() {
    return 'black-out';
  }

  static clone(node) {
    return new BlackOutNode(node.__className, node.__users);
  }

  isEditable() {
    return !this.getCurrentUser() || this.__users?.find((value) => value === this.getCurrentUser());
  }

  setUsers(_users) {
    this.__users = _users;
    return false;
  }

  addUser(user) {
    this.__users.push(user);
    return false;
  }

  setCurrentUser(currentUser) {
    this.__currentUser = currentUser;
  }

  getCurrentUser() {
    return this.__currentUser;
  }

  getUsers() {
    return this.__users;
  }

  constructor(className, users, key) {
    super(key);
    this.__className = className;
    this.__users = users;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'black-out',
      className: this.__className,
      users: this.__users,
      version: 1
    };
  }

  static importJSON(serializedNode) {
    const node = $createBlackoutNode(serializedNode.className, serializedNode.users);
    return node;
  }

  createDOM() {
    const span = document.createElement('span');
    span.dataset.users = this.getUsers();
    span.style.border = '1px dotted black';
    if (!this.isEditable()) {
      span.style.backgroundColor = 'black';
      span.contentEditable = 'false';
    }
    return span;
  }

  // eslint-disable-next-line class-methods-use-this
  updateDOM(prevNode, dom, config) {
    if (!this.isEditable()) {
      dom.style.backgroundColor = 'black';
      dom.contentEditable = 'false';
    } else {
      dom.style.backgroundColor = 'white';
      dom.contentEditable = 'true';
    }
    return true;
  }

  isInline() {
    return true;
  }

  exportDOM() {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-black-out', 'true');
    element.setAttribute('data-users', JSON.stringify(this.__users));
    return { element };
  }

  static importDOM() {
    return {
      span: (domNode) => {
        if (!domNode.hasAttribute('data-lexical-black-out')) {
          return null;
        }
        return {
          conversion: convertBlackoutElement,
          priority: 1
        };
      }
    };
  }
}

function convertBlackoutElement(domNode) {
  const { className, dataset } = domNode;
  const node = $createBlackoutNode(className, JSON.parse(dataset.users));
  return {
    node
  };
}

export function $isBlackoutNode(node) {
  return node instanceof BlackOutNode;
}

export function $createBlackoutNode(className, users) {
  const blackoutNode = new BlackOutNode(className, users);
  return $applyNodeReplacement(blackoutNode);
}
