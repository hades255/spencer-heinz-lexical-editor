import { $isElementNode, ElementNode } from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
import LexicalTheme from '../utils/theme';
import BlackoutIcon from '../styles/blackout.svg';
import { debounce } from 'lodash';
import { $isCommentNode } from './commentNode';
import { PERMISSION_TASK } from 'lexical-editor/utils/constants';
/**
 * @class lock element node class
 */
export class BlackoutNode extends ElementNode {
  /** @internal class name for this dom element*/
  __className;
  /** @internal users unlocked for this block of content*/
  __users;
  /** !for local only! @internal user logged in now */
  __user;
  static __currentUser;

  static getType() {
    return 'black-out';
  }

  static clone(node) {
    return new BlackoutNode(node.__className, node.__users, node.__user);
  }

  static setCurrentUser(_user) {
    BlackoutNode.__currentUser = _user;
    return false;
  }

  constructor(className, users, user, key) {
    super(key);
    this.__className = className;
    this.__users = users;
    this.__user = user;
  }

  isEditable() {
    const currentUser = BlackoutNode.__currentUser;
    return !currentUser || this.__users.find((value) => value === currentUser);
  }

  setUsers(_users) {
    const writable = this.getWritable();
    writable.__users = _users;
    return false;
  }

  getUsers() {
    const node = this.getLatest();
    return node.__users;
  }

  getUser() {
    const node = this.getLatest();
    return node.__user;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'black-out',
      className: this.__className,
      users: this.__users,
      user: this.__user,
      version: 1
    };
  }

  static importJSON(serializedNode) {
    const node = $createBlackoutNode(serializedNode.className, serializedNode.users, serializedNode.user);
    return node;
  }

  createDOM() {
    const parentNode = this.getParent();
    const span = document.createElement('span');
    span.setAttribute('data-lexical-black-out', 'true');
    span.setAttribute('data-users', JSON.stringify(this.__users));
    span.setAttribute('data-user', JSON.stringify(this.__user));
    this.isEditable() ? addClassNamesToElement(span, LexicalTheme.blackout) : addClassNamesToElement(span, LexicalTheme.inactiveBlackout);
    if (!this.isEditable()) {
      span.style.setProperty('-webkit-text-security', 'disc');
      span.setAttribute('contenteditable', false);
    }
    const IconImage = document.createElement('img');
    IconImage.setAttribute('src', BlackoutIcon);
    addClassNamesToElement(IconImage, LexicalTheme.blackoutIcon);
    if ($isCommentNode(parentNode) && parentNode.getComments().find((item) => PERMISSION_TASK.includes(item.task))) {
      const _comments = parentNode.getComments().filter((item) => item.commentor._id === BlackoutNode.__currentUser);
      if (_comments.length || this.getUsers().includes(BlackoutNode.__currentUser)) {
        addClassNamesToElement(
          IconImage,
          parentNode.isTouched() ? LexicalTheme.requestPermissionIcon : LexicalTheme.requestPermissionIconUntouched
        );
      }
    }
    IconImage.addEventListener('click', (e) => {
      // set selection of first child node so that comment box appears
      let range = new Range();

      range.setStart(e.target.nextSibling, 0);
      range.setEnd(e.target.nextSibling, 0);

      // apply the selection, explained later below
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(range);
      setTimeout(() => {
        debouncedClickBlackoutBtn();
      }, 300);
      // }
    });
    span.appendChild(IconImage);
    return span;
  }

  // eslint-disable-next-line no-unused-vars
  updateDOM(prevNode, dom, config) {
    const blackoutSpan = dom;
    blackoutSpan.setAttribute('data-users', JSON.stringify(this.__users));
    blackoutSpan.setAttribute('data-user', JSON.stringify(this.__user));
    this.isEditable()
      ? addClassNamesToElement(blackoutSpan, LexicalTheme.blackout)
      : addClassNamesToElement(blackoutSpan, LexicalTheme.inactiveBlackout);
    if (!this.isEditable()) {
      blackoutSpan.style.setProperty('-webkit-text-security', 'disc');
      blackoutSpan.setAttribute('contenteditable', false);
    }
    return false;
  }

  exportDOM() {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-black-out', 'true');
    element.setAttribute('data-users', JSON.stringify(this.__users));
    element.setAttribute('data-user', JSON.stringify(this.__user));
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

  isInline() {
    return true;
  }

  canMergeWith(sibling) {
    const node = this.getLatest();
    if (node.getUsers() === sibling.getUsers()) {
      return true;
    }
    return false;
  }

  insertNewAfter(selection) {
    const element = this.getParentOrThrow().insertNewAfter(selection);

    if ($isElementNode(element)) {
      const blackoutNode = $createBlackoutNode(this.__className, this.__users, this.__user);

      element?.append(blackoutNode);

      return blackoutNode;
    }
    return null;
  }

  canInsertTextBefore() {
    return false;
  }

  canBeEmpty() {
    return false;
  }

  canInsertTextAfter() {
    return false;
  }

  canExtractContents() {
    return false;
  }

  extractWithChild() {
    return !this.isEditable();
  }
}

function convertBlackoutElement(domNode) {
  const { className, dataset } = domNode;
  const node = $createBlackoutNode(className, JSON.parse(dataset.users), JSON.parse(dataset.user));
  return {
    node
  };
}

export function $isBlackoutNode(node) {
  return node instanceof BlackoutNode;
}

export function $createBlackoutNode(className, users, user) {
  const blackoutNode = new BlackoutNode(className, users, user);
  return blackoutNode;
}

export function isBlackedOutNode(_node, user) {
  let validationFlag = false;
  const parents = _node.getParents();
  parents
    .filter((element) => $isBlackoutNode(element))
    .map((elementNode) => {
      const unlockedUsers = elementNode.getUsers();
      if (!unlockedUsers.includes(user)) {
        validationFlag = true;
        return false;
      }
    });
  return validationFlag;
}

function clickBlackoutBtn() {
  const lockBtn = document.getElementById('blackout-btn');
  lockBtn.click();
}

const debouncedClickBlackoutBtn = debounce(clickBlackoutBtn, 100);
