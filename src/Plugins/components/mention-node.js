import { isUndefined } from 'lodash';
import { UserTextNode } from './user-text-node';
import { $applyNodeReplacement } from 'lexical';

export class MentionNode extends UserTextNode {
  __className;
  __creator;
  __text;
  __comments;

  static getType() {
    return 'mention';
  }

  static clone(node) {
    return new MentionNode(
      node.__className,
      node.__text,
      [...node.__comments],
      node.__users,
      node.__creator,
      node.__isLocked,
      node.__format
    );
  }

  setFilterType(_filter) {
    this.__filterType = _filter;
    return false;
  }

  getFilterType() {
    return this.__filterType;
  }

  isActive() {
    return !this.getFilterType() || this.__comments.find((value) => value.car === this.getFilterType());
  }

  constructor(className, text, comments, users, creator, isLocked = false, format, key) {
    super(text, key);
    this.__className = className;
    this.__text = text;
    this.__users = users;
    this.__comments = comments;
    this.__isLocked = isLocked;
    this.__creator = creator;
    this.__format = format;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.className = this.isActive() ? (this.__comments.length > 1 ? 'multi-mention' : this.__className) : `mention-inactive`;
    dom.dataset.comment = JSON.stringify(this.__comments);
    return dom;
  }

  updateDOM(prevNode, dom, config) {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    dom.classList.remove('mention-inactive', 'text-inactive');
    dom.classList.add(this.isActive() ? (this.__comments.length > 1 ? 'multi-mention' : this.__className) : `mention-inactive`);
    dom.style.display = this.isEditable() || this.__visible ? 'inline' : 'none';
    return isUpdated;
  }

  addComment(_comment) {
    this.__comments.unshift(_comment);
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

  getCreator() {
    return this.__creator;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'mention',
      comments: this.getComments(),
      users: this.getUsers(),
      text: this.getTextContent(),
      isLocked: this.isLocked(),
      version: 1
    };
  }
}

export function $isMentionNode(node) {
  return node instanceof MentionNode;
}

export function $isAdvancedNode(node) {
  return node instanceof MentionNode || node instanceof UserTextNode;
}

export function $createMentionNode(className, mentionText, commentText, users, creator, isLocked, format) {
  const newMentionNode = new MentionNode(className, mentionText, commentText, users, creator, isLocked, format).toggleDirectionless();
  return $applyNodeReplacement(newMentionNode);
}
