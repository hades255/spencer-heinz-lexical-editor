import { $applyNodeReplacement, TextNode } from 'lexical';

export class UserTextNode extends TextNode {
  __className;
  __text;
  __users;
  __currentUser;
  __isLocked;
  __visible = true;

  static getType() {
    return 'user-text';
  }

  static clone(node) {
    return new UserTextNode(node.__className, node.__text, node.__users, node.__isLocked, node.__format, node.__key);
  }

  setCurrentUser(_user) {
    this.__currentUser = _user;
    return false;
  }

  getCurrentUser() {
    return this.__currentUser;
  }

  setVisible(_visible) {
    this.__visible = _visible;
  }

  getVisible() {
    return this.__visible;
  }

  setLocked(_isLocked) {
    this.__isLocked = _isLocked;
    return false;
  }

  isLocked() {
    return this.__isLocked;
  }

  isEditable() {
    return !this.getCurrentUser() || !this.isLocked() || this.__users.find((value) => value === this.getCurrentUser());
  }

  constructor(className, text, users, isLocked = false, format, key) {
    super(text, key);
    this.__className = className;
    this.__text = text;
    this.__users = users;
    this.__isLocked = isLocked;
    this.__format = format;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.classList.add(this.isEditable() ? (this.isLocked() ? 'text-locked' : this.__className) : `text-inactive`);
    dom.dataset.users = JSON.stringify(this.__users);
    return dom;
  }

  updateDOM(prevNode, dom, config) {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    const _contenteditable = this.isEditable() ? 'true' : 'false';
    dom.setAttribute('contenteditable', _contenteditable);
    // dom.style.display = this.isEditable() || this.__visible ? 'inline' : 'none';
    if (this.isEditable()) {
      dom.classList.remove(`text-inactive`, 'text-disabled');
      dom.classList.add(this.isLocked() ? 'text-locked' : this.__className);
    } else {
      if (this.__visible) {
        dom.classList.remove('text-disabled');
        dom.classList.add(`text-inactive`);
      } else {
        dom.classList.add(`text-disabled`);
      }
    }

    return isUpdated;
  }

  addUser(_user) {
    if (this.__users.indexOf(_user) === -1) {
      this.__users.push(_user);
    }
    return false;
  }

  addUsers(_users) {
    this.__users = this.__users.concat(not(_users, this.__users));
    return false;
  }

  setUsers(_users) {
    this.__users = _users;
    return false;
  }

  getUsers() {
    return this.__users;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'user-text',
      users: this.getUsers(),
      text: this.getTextContent(),
      isLocked: this.isLocked(),
      version: 1
    };
  }
  isTextEntity() {
    return true;
  }
}

export function $isUserTextNode(node) {
  return node instanceof UserTextNode;
}

export function $createUserTextNode(className, contentText, _users, _isLocked, _format) {
  const userTextNode = new UserTextNode(className, contentText, [..._users], _isLocked, _format).toggleDirectionless();
  userTextNode.setMode('segmented').toggleDirectionless();
  return $applyNodeReplacement(userTextNode);
}

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}
