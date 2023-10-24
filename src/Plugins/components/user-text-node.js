import { USER_OPTIONS } from 'Plugins/constants';
import { $applyNodeReplacement, TextNode } from 'lexical';
import { debounce, isEqual, isUndefined } from 'lodash';
import { $isBlackoutNode } from './black-out-node';

/**
 * @class UserTextNode for comments, lock
 */
export class UserTextNode extends TextNode {
  /** @internal unique id for this node ** connecting to database!!*/
  __uniqueId;
  /** @internal class name for this dom element*/
  __className;
  /** @internal text content for this dom element */
  __text;
  /** @internal allowed users to edit */
  __users; // need to preserve
  /** @internal user that currently authorized */
  __currentUser;
  /** @internal flag for locked status */
  __isLocked; // need to preserve
  /** @internal creator for this node */
  __creator; // need to preserve
  /** @internal visible locked or unlocked  */
  __visible = true; // need to preserve
  /** @internal comments on this node  */
  __comments; // need to preserve
  /** @internal currently selected car model  */
  __filterType = ''; // need to preserve
  /** @internal locked time if this node is locked  */
  __lockedTime = ''; // need to preserve

  /**
   * @returns type of node
   */
  static getType() {
    return 'user-text';
  }

  /**
   *
   * @param {UserTextNode} node
   * @returns cloned node of existing node
   */
  static clone(node) {
    return new UserTextNode(
      node.__className,
      node.__text,
      [...node.__comments],
      node.__users,
      node.__creator,
      node.__isLocked,
      node.__format,
      node.__lockedTime,
      node.__uniqueId
    );
  }

  /**
   *
   * @param {String} _uniqueId
   * @function set unique id of this node
   */

  setUniqueId(_uniqueId) {
    this.__uniqueId = _uniqueId;
    return false;
  }

  /**
   *
   * @function get unique id of this node
   */
  getUniqueId() {
    return this.__uniqueId;
  }

  /**
   *
   * @param {String} _filter
   * @function set current car filter type
   */
  setFilterType(_filter) {
    this.__filterType = _filter;
    return false;
  }

  /**
   *
   * @returns current car type selected
   */
  getFilterType() {
    return this.__filterType;
  }

  /**
   *
   * @returns check if comments has filter type or not
   */
  isActive() {
    return !this.getFilterType() || this.__comments.find((value) => value.car === this.getFilterType());
  }

  setCurrentUser(_user) {
    // check if node is created right before and set creator as currentUser and users as currentUser
    if (isUndefined(this.__creator)) {
      this.__creator = _user;
      // this.__users = [];
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
    // if (this.__currentUser !== this.getCreator()) {
    //   console.log('Error-lock-node: Only owner can lock this block.');
    //   return false;
    // }
    this.__isLocked = _isLocked;
    _isLocked ? (this.__lockedTime = new Date().toISOString()) : null;
    return false;
  }

  setLockedTime(_lockedTime) {
    this.__lockedTime = _lockedTime;
    return false;
  }

  isLocked() {
    return this.__isLocked;
  }

  getLockedTime() {
    return this.__lockedTime;
  }

  isEditable() {
    return !this.getCurrentUser() || !this.isLocked() || this.__users.find((value) => value === this.getCurrentUser());
  }

  constructor(className, text, comments, users, creator, isLocked = false, format, lockedTime, uniqueId, key) {
    super(text, key);
    this.__className = className;
    this.__text = text;
    this.__users = users;
    this.__comments = comments;
    this.__isLocked = isLocked;
    this.__creator = creator;
    this.__format = format;
    this.__lockedTime = lockedTime;
    this.__uniqueId = uniqueId;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    // check if this node is in the black-out node
    if (this.getParent() && $isBlackoutNode(this.getParent())) {
      if (!this.getParent().isEditable()) {
        dom.innerText = ' '.repeat(this.getTextContent().length);
        return dom;
      }
    }
    if (this.__comments.length) {
      dom.className = this.isActive() ? (this.__comments.length > 1 ? 'multi-mention' : 'mention') : `mention-inactive`;
    } else {
      dom.classList.add(this.isEditable() ? (this.isLocked() ? 'text-locked' : this.__className) : `text-inactive`);
    }

    //if text is locked
    if (this.isLocked()) {
      dom.classList.add('tooltip');
      const toolTipElement = document.createElement('span');
      toolTipElement.innerHTML = `Locked by <strong>${this.getCreator()}</strong> at <br/> ${this.getLockedTime()}`;
      toolTipElement.className = `tooltiptext`;
      dom.append(toolTipElement);
    }
    return dom;
  }
  /**
   *
   * @param {UserTextNode} prevNode
   * @param {DomNode} dom
   * @param {Config} config
   * @description updates the dom element of this node according to chnage
   */
  updateDOM(prevNode, dom, config) {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    // check if this node is in the black-out node
    if (this.getParent() && $isBlackoutNode(this.getParent())) {
      if (!this.getParent().isEditable()) {
        dom.innerText = ' '.repeat(this.getTextContent().length);
        return isUpdated;
      }
    }
    const _contenteditable = this.isEditable() ? 'true' : 'false';
    dom.setAttribute('contenteditable', _contenteditable);
    dom.classList.remove(`text-locked`, `text-inactive`, 'text-disabled', 'mention-inactive', 'tooltip');

    // remove all previous tooltips
    const toolTipElement = dom.querySelector('.tooltiptext');
    toolTipElement ? toolTipElement.parentElement.removeChild(toolTipElement) : false;
    if (this.__comments.length) {
      dom.className = this.isActive() ? (this.__comments.length > 1 ? 'multi-mention' : 'mention') : `mention-inactive`;
    }
    if (this.isEditable()) {
      dom.classList.add(this.isLocked() ? 'text-locked' : 'user-text');
    } else {
      // if text is not editable for this user.
      if (this.__visible) {
        dom.classList.add(`text-inactive`);
      } else {
        dom.classList.add(`text-disabled`);
      }
    }

    //if text is locked
    if (this.isLocked()) {
      dom.classList.add('tooltip');
      const toolTipElement = document.createElement('span');
      toolTipElement.innerHTML = `Locked by <strong>${this.getCreator()}</strong> at <br/> ${this.getLockedTime()}`;
      toolTipElement.className = `tooltiptext`;
      dom.append(toolTipElement);
    }

    return isUpdated;
  }
  /**
   *
   * @param {String} _user
   * @description add single user to users arrray
   */
  addUser(_user) {
    if (this.__users.indexOf(_user) === -1) {
      this.__users.push(_user);
    }
    // check if all users are unlocked, then unlock the text
    if (isEqual(USER_OPTIONS, this.__users?.sort())) {
      this.__isLocked = false;
      // set users as empty array for unlocked node
      this.__users = [];
    }
    return false;
  }

  addUsers(_users) {
    this.__users = this.__users.concat(not(_users, this.__users));
    // check if all users are unlocked, then unlock the text
    if (isEqual(USER_OPTIONS, this.__users?.sort())) {
      this.__isLocked = false;
      // set users as empty array for unlocked node
      this.__users = [];
    }
    return false;
  }

  /**
   *
   * @param {Array} _users
   * @function set users of node
   */
  setUsers(_users) {
    this.__users = _users;
    // check if all users are unlocked, then unlock the text
    if (isEqual(USER_OPTIONS, this.__users.sort())) {
      this.__isLocked = false;
      // set users as empty array for unlocked node
      this.__users = [];
    }
    return false;
  }

  getUsers() {
    return this.__users;
  }
  addComment(_comment) {
    this.__comments.unshift(_comment);
    return false;
  }

  setComments(_comments) {
    this.__comments = [..._comments];
    return false;
  }

  addReply(_commentIndex, _content, _replier) {
    let _comment = this.__comments[_commentIndex];
    let _replies = _comment['replies'];
    if (isUndefined(_comment)) {
      return false;
    }
    _replies.unshift({ content: _content, replier: _replier, date: new Date().toISOString() });
    return true;
  }

  getReplies(_commentIndex) {
    let _comment = this.__comments[_commentIndex];
    if (isUndefined(_comment)) {
      return [];
    }
    const _replies = _comment['replies'];
    return _replies;
  }

  getComments() {
    return this.__comments;
  }

  setCreator(_creator) {
    this.__creator = _creator;
  }

  getCreator() {
    return this.__creator;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'user-text',
      comments: this.getComments(), // enable to chnage when locked
      users: this.getUsers(),
      text: this.getTextContent(),
      isLocked: this.isLocked(),
      lockedTime: this.getLockedTime(),
      uniqueId: this.getUniqueId(),
      version: 1
    };
  }
  static importJSON(serializedNode) {
    const node = $createUserTextNode(
      'user-text',
      serializedNode.text,
      serializedNode.comments,
      serializedNode.users,
      serializedNode.creator,
      serializedNode.isLocked,
      serializedNode.format,
      serializedNode.lockedTime,
      serializedNode.uniqueId
    );
    return node;
  }

  isTextEntity() {
    return true;
  }
}

export function $isUserTextNode(node) {
  return node instanceof UserTextNode;
}

export function $createUserTextNode(className, contentText, comments, _users, _creator, _isLocked, _format, _lockedTime, _uniqueId) {
  const userTextNode = new UserTextNode(
    className,
    contentText,
    comments,
    [..._users],
    _creator,
    _isLocked,
    _format,
    _lockedTime,
    _uniqueId
  );
  userTextNode.toggleDirectionless();
  return $applyNodeReplacement(userTextNode);
}

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}
