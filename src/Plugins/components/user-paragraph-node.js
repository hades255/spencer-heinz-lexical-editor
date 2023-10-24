import { $applyNodeReplacement, ParagraphNode, TextNode } from 'lexical';

export class UserParagraphNode extends ParagraphNode {
  /** @internal unique id for this node ** connecting to database!!*/
  __uniqueId;
  /** @internal class name for this dom element*/
  __className;
  /** @internal allowed users to edit */
  __users;
  /** @internal user that currently authorized */
  __currentUser;
  /** @internal flag for locked status */
  __isLocked;
  /** @internal creator for this node */
  __creator;
  /** @internal visible locked or unlocked  */
  __visible = true;

  static getType() {
    return 'user-paragraph';
  }

  static clone(node) {
    return new UserParagraphNode(
      node.__className,
      node.__users,
      node.__creator,
      node.__isLocked,
      node.__format,
      node.__uniqueId,
      node.__key
    );
  }

  setUniqueid(_uniqueId) {
    this.__uniqueId = _uniqueId;
    return false
  }

  getUniqueid() {
    return this.__uniqueId;
  }

  setCurrentUser(_user) {
    // check if node is created right before and set creator as currentUser
    if (this.__creator === undefined) {
      this.__creator = _user;
    }
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

  constructor(className, users, creator, isLocked = false, format, uniqueId, key) {
    super(key);
    this.__className = className;
    this.__users = users;
    this.__isLocked = isLocked;
    this.__creator = creator;
    this.__format = format;
    this.__uniqueId = uniqueId;
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

  getCreator() {
    return this.__creator;
  }

  static importJSON(serializedNode) {
    const node = $createUserParagraphNode(
      'user-paragraph',
      serializedNode.users,
      serializedNode.creator,
      serializedNode.isLocked,
      serializedNode.format,
      serializedNode.uniqueId
    );
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'user-paragraph',
      users: this.getUsers(),
      isLocked: this.isLocked(),
      creator: this.getCreator(),
      format: this.getFormat(),
      uniqueId: this.getUniqueid(),
      version: 1
    };
  }
}

export function $isUserParagraphNode(node) {
  return node instanceof UserParagraphNode;
}

export function $createUserParagraphNode(className, _users, _creator, _isLocked, _format, _uniqueId) {
  const userParagraphNode = new UserParagraphNode(className, [..._users], _creator, _isLocked, _format, _uniqueId);
  return $applyNodeReplacement(userParagraphNode);
}
