import { $isElementNode, ElementNode } from 'lexical';
import { addClassNamesToElement, removeClassNamesFromElement } from '@lexical/utils';
import LexicalTheme from '../utils/theme';
import { isUndefined } from 'lodash';
import CommentIcon from '../styles/comment.svg';
import { not } from 'utils/array';
import { $isBlackoutNode, isBlackedOutNode } from './blackoutNode';
import axiosServices from 'utils/axios';
import { PERMISSION_TASK } from 'lexical-editor/utils/constants';

/**
 * @class comment element node class
 */
export class CommentNode extends ElementNode {
  /** @internal class name for this dom element*/
  __className;
  /** @internal comments for this element*/
  __comments;
  /** @internal flag for newly created or updated or not*/
  __newOrUpdated = [];

  /** @internal ! for local use only ! flag for suppressed or not*/
  __suppressed = false;
  /** @internal ! for local use only ! currentUser*/
  static __currentUser;
  static __team;

  static getType() {
    return 'comment';
  }

  static clone(node) {
    return new CommentNode(node.__className, node.__comments, node.__newOrUpdated);
  }

  static setCurrentUser(_user) {
    CommentNode.__currentUser = _user;
    return false;
  }

  static setCurrentTeam(_team) {
    CommentNode.__team = _team;
    return false;
  }

  static setUsers(_users) {
    CommentNode.__users = _users;
    return false;
  }

  constructor(className, comments, newOrUpdated, key) {
    super(key);
    this.__className = className;
    this.__comments = comments;
    this.__newOrUpdated = newOrUpdated;
  }

  isEditable() {
    const currentUser = CommentNode.__currentUser;
    return !currentUser || this.__users?.find((value) => value === currentUser);
  }

  addComment(_comment) {
    const writable = this.getWritable();
    writable.__comments.unshift(_comment);
    return false;
  }

  setComments(_comments) {
    const writable = this.getWritable();
    writable.__comments = _comments;
    return false;
  }

  addReply(_commentIndex, _content, _replier) {
    const writable = this.getWritable();
    let _comment = writable.__comments[_commentIndex];
    if (isUndefined(_comment)) {
      return false;
    }
    let _replies = _comment['replies'];
    _replies.unshift({ content: _content, replier: _replier, date: new Date().toISOString() });
    if (!PERMISSION_TASK.includes(_comment.task)) {
      (async () => {
        try {
          const res = await axiosServices.post('/task/uniqueId/' + _comment['uniqueId'] + '/reply', {
            content: _content,
            replier: _replier
          });
          console.log(res);
        } catch (error) {
          console.log(error);
        }
      })();
    }
    return true;
  }

  getReplies(_commentIndex) {
    const node = this.getLatest();
    let _comment = node.__comments[_commentIndex];
    if (isUndefined(_comment)) {
      return [];
    }
    const _replies = _comment['replies'];
    return _replies;
  }

  setStatus(_commentIndex, status) {
    const writable = this.getWritable();
    let _comment = writable.__comments[_commentIndex];
    if (isUndefined(_comment)) {
      return false;
    }
    _comment['status'] = status;
    return true;
  }

  getComments() {
    const node = this.getLatest();
    return node.__comments;
  }

  addNewOrUpdated(_user) {
    const writable = this.getWritable();
    if (!this.isTouched()) {
      writable.__newOrUpdated.unshift(_user);
    }
    return writable;
  }

  getNewOrUpdated() {
    return this.__newOrUpdated;
  }

  isTouched() {
    return !CommentNode.__currentUser || this.__newOrUpdated?.includes(CommentNode.__currentUser);
  }

  setSuppressed(flag) {
    const writable = this.getWritable();
    writable.__suppressed = flag;
    return false;
  }

  getSuppressed() {
    const node = this.getLatest();
    return node.__suppressed;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'comment',
      className: this.__className,
      comments: this.__comments,
      newOrUpdated: this.__newOrUpdated,
      version: 1
    };
  }

  static importJSON(serializedNode) {
    const node = $createCommentNode(serializedNode.className, serializedNode.comments, serializedNode.newOrUpdated);
    return node;
  }

  createDOM() {
    const span = document.createElement('span');
    // check if blacked out and return empty span
    if (
      isBlackedOutNode(this, CommentNode.__currentUser) &&
      !this.getComments()?.find((comment) => comment.commentor._id === CommentNode.__currentUser)
    ) {
      return span;
    }
    let blackoutList = [];
    if (this.getComments().find((item) => PERMISSION_TASK.includes(item.task))) {
      const childNode = this.getFirstChild();
      if ($isBlackoutNode(childNode)) blackoutList = childNode.__users;
    }

    let nComments = this.getComments()?.filter((comment) =>
      PERMISSION_TASK.includes(comment.task)
        ? comment.commentor._id === CommentNode.__currentUser || blackoutList.includes(CommentNode.__currentUser)
        : comment.commentor._id === CommentNode.__currentUser ||
          comment.assignee === CommentNode.__currentUser ||
          !comment.commentor.team ||
          comment.commentor.team === CommentNode.__team
    );
    if (!nComments || nComments?.length === 0) return span;

    // let _users = this.__users;
    // nComments = nComments.map((item) => ({
    //   ...item,
    //   commentor:
    //     item.commentor.team !== CommentNode.__team || _users.find((x) => x.team === item.commentor.team && x.leader)
    //       ? _users.find((x) => x.team === item.commentor.team && x.leader)
    //       : item.commentor
    // }));
    // nComments = nComments.map((item) => ({ ...item, comment: 'AAA' }));
    span.setAttribute('data-lexical-comment', 'true');
    span.setAttribute('data-lexical-text', 'true');
    span.setAttribute('data-comments', JSON.stringify(nComments));
    span.setAttribute('data-new_or_updated', JSON.stringify(this.__newOrUpdated));
    if (blackoutList.length === 0) {
      addClassNamesToElement(span, LexicalTheme.comment);
      const IconImage = document.createElement('img');
      IconImage.setAttribute('src', CommentIcon);
      // add unsuppressing click event listener to icon image
      IconImage.addEventListener('click', (e) => {
        e.stopPropagation();
        const storedValue = window.localStorage.getItem('suppressedComments');
        let suppressedUniqueIds = storedValue === null ? [] : JSON.parse(storedValue);
        suppressedUniqueIds = not(
          suppressedUniqueIds,
          nComments.map((value) => value.uniqueId)
        );
        window.localStorage.setItem('suppressedComments', JSON.stringify(suppressedUniqueIds));
        // set selection of first child node so that comment box appears
        let range = new Range();

        // if (e.target.nextElementSibling) {
        range.setStart(e.target.nextElementSibling, 0);
        range.setEnd(e.target.nextElementSibling, 0);
        // }

        // apply the selection, explained later below
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);

        // set new or updated flag -> false
        removeClassNamesFromElement(e.target.parentNode, LexicalTheme.suppressedComment);
        removeClassNamesFromElement(e.target, LexicalTheme.commentIconUnTouched);
        addClassNamesToElement(e.target, LexicalTheme.commentIcon);
      });
      IconImage.addEventListener('mouseover', (e) => {
        e.stopPropagation();
      });
      const storedValue = window.localStorage.getItem('suppressedComments');
      let suppressedUniqueIds = storedValue === null ? [] : JSON.parse(storedValue);
      if (nComments.filter((value) => suppressedUniqueIds.includes(value.uniqueId)).length === nComments.length) {
        addClassNamesToElement(span, LexicalTheme.suppressedComment);
      }

      addClassNamesToElement(IconImage, this.isTouched() ? LexicalTheme.commentIcon : LexicalTheme.commentIconUnTouched);
      span.appendChild(IconImage);
    }
    return span;
  }

  // eslint-disable-next-line no-unused-vars
  updateDOM(prevNode, dom, config) {
    const commentSpan = dom;
    commentSpan.setAttribute('data-comments', JSON.stringify(this.getComments()));
    commentSpan.setAttribute('data-new_or_updated', JSON.stringify(this.__newOrUpdated));

    const storedValue = window.localStorage.getItem('suppressedComments');
    let suppressedUniqueIds = storedValue === null ? [] : JSON.parse(storedValue);
    removeClassNamesFromElement(commentSpan, LexicalTheme.suppressedComment);
    if (this.getComments().filter((value) => suppressedUniqueIds.includes(value.uniqueId)).length === this.getComments().length) {
      addClassNamesToElement(commentSpan, LexicalTheme.suppressedComment);
    } else if (this.getSuppressed()) {
      addClassNamesToElement(commentSpan, LexicalTheme.suppressedComment);
    }
    //  else {
    //   removeClassNamesFromElement(commentSpan, LexicalTheme.suppressedComment);
    // }
    const iconImage = commentSpan.getElementsByTagName('img')[0];
    if (this.isTouched()) {
      removeClassNamesFromElement(iconImage, LexicalTheme.commentIconUnTouched);
      addClassNamesToElement(iconImage, LexicalTheme.commentIcon);
    }
    return false;
  }

  exportDOM() {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-comment', 'true');
    element.setAttribute('data-comments', JSON.stringify(this.getComments()));
    element.setAttribute('data-new_or_updated', JSON.stringify(this.__newOrUpdated));
    return { element };
  }

  static importDOM() {
    return {
      span: (domNode) => {
        if (!domNode.hasAttribute('data-lexical-comment')) {
          return null;
        }
        return {
          conversion: convertCommentElement,
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
    if (node.getComments() === sibling.getComments()) {
      return true;
    }
    return false;
  }

  insertNewAfter(selection) {
    const element = this.getParentOrThrow().insertNewAfter(selection);

    if ($isElementNode(element)) {
      const commentNode = $createCommentNode(this.__className, this.getComments(), this.__newOrUpdated);

      element?.append(commentNode);

      return commentNode;
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

function convertCommentElement(domNode) {
  const { className, dataset } = domNode;
  const node = $createCommentNode(className, JSON.parse(dataset.comments, JSON.parse(dataset.new_or_updated)));
  return {
    node
  };
}

export function $isCommentNode(node) {
  return node instanceof CommentNode;
}

export function isCommentNode(_node, user) {
  const _comments = _node.getComments();
  if ($isCommentNode(_node)) {
    const _can = _comments.filter((item) => item.commentor._id === user);
    // console.log(_can); //  touch this
    if (_can && _can.length) return false;
    return true;
  } else {
    return false;
  }
}

export function canRemoveCommentNode(_node, user) {
  if ($isCommentNode(_node)) {
    const __comments = _node.getComments();
    let flag = false;
    __comments.forEach((comment) => {
      if (comment.commentor._id !== user) flag = true;
    });
    return flag;
  }
  return false;
}

export function $createCommentNode(className, comments, newOrUpdated = []) {
  const commentNode = new CommentNode(className, comments, newOrUpdated);
  return commentNode;
}
