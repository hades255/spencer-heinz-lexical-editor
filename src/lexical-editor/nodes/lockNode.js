import { $isElementNode, ElementNode } from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
import LexicalTheme from '../utils/theme';
import LockIcon from '../styles/lock.svg';
import { debounce } from 'lodash';

/**
 * @class lock element node class
 */
export class LockNode extends ElementNode {
  /** @internal class name for this dom element*/
  __className;
  /** @internal users unlocked for this block of content*/
  __users;
  /** @internal user who locked this block of text*/
  __locker;
  /** @internal timestamp locked*/
  __timestamp;
  /** !for local only! @internal user logged in now */
  static __currentUser;

  static getType() {
    return 'lock';
  }

  static clone(node) {
    return new LockNode(node.__className, node.__users, node.__locker, node.__timestamp);
  }

  static setCurrentUser(_user) {
    LockNode.__currentUser = _user;
    return false;
  }

  constructor(className, users, locker, timestamp = new Date().toISOString(), key) {
    super(key);
    this.__className = className;
    this.__users = users;
    this.__locker = locker;
    this.__timestamp = timestamp;
  }

  isEditable() {
    const currentUser = LockNode.__currentUser;
    console.log(currentUser, this.__users);
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

  getLocker() {
    const node = this.getLatest();
    return node.__locker;
  }

  getTimestamp() {
    const node = this.getLatest();
    return node.__timestamp;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'lock',
      className: this.__className,
      users: this.__users,
      locker: this.__locker,
      timestamp: this.__timestamp,
      version: 1
    };
  }

  static importJSON(serializedNode) {
    const node = $createLockNode(serializedNode.className, serializedNode.users, serializedNode.locker, serializedNode.timestamp);
    return node;
  }

  createDOM() {
    const span = document.createElement('span');
    span.setAttribute('data-lexical-lock', 'true');
    span.setAttribute('data-users', JSON.stringify(this.__users));
    span.setAttribute('data-locker', this.__locker);
    span.setAttribute('data-timestamp', this.__timestamp);
    this.isEditable() ? addClassNamesToElement(span, LexicalTheme.lock) : addClassNamesToElement(span, LexicalTheme.inactiveLock);
    if (!this.isEditable()) {
      span.setAttribute('contenteditable', false);
    }
    const IconImage = document.createElement('img');
    IconImage.setAttribute('src', LockIcon);
    IconImage.addEventListener('click', (e) => {
      // set selection of first child node so that comment box appears
      let range = new Range();

      range.setStart(e.target.nextSibling, 0);
      range.setEnd(e.target.nextSibling, 0);

      // apply the selection, explained later below
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(range);
      debouncedClickLockBtn();
      // }
    });
    addClassNamesToElement(IconImage, LexicalTheme.lockIcon);
    span.appendChild(IconImage);
    return span;
  }

  // eslint-disable-next-line no-unused-vars
  updateDOM(prevNode, dom, config) {
    const lockSpan = dom;
    lockSpan.setAttribute('data-users', JSON.stringify(this.__users));
    lockSpan.setAttribute('data-locker', this.__locker);
    lockSpan.setAttribute('data-timestamp', this.__timestamp);
    this.isEditable() ? addClassNamesToElement(lockSpan, LexicalTheme.lock) : addClassNamesToElement(lockSpan, LexicalTheme.inactiveLock);
    if (!this.isEditable()) {
      lockSpan.setAttribute('contenteditable', false);
    }
    return false;
  }

  exportDOM() {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-lock', 'true');
    element.setAttribute('data-users', JSON.stringify(this.__users));
    element.setAttribute('data-locker', this.__locker);
    element.setAttribute('data-timestamp', this.__timestamp);
    return { element };
  }

  static importDOM() {
    return {
      span: (domNode) => {
        if (!domNode.hasAttribute('data-lexical-lock')) {
          return null;
        }
        return {
          conversion: convertLockElement,
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
      const lockNode = $createLockNode(this.__className, this.__users, this.__locker, this.__timestamp);

      element?.append(lockNode);

      return lockNode;
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
}

function convertLockElement(domNode) {
  const { className, dataset } = domNode;
  const node = $createLockNode(className, JSON.parse(dataset.users), dataset.locker, dataset.timestamp);
  return {
    node
  };
}

export function $isLockNode(node) {
  return node instanceof LockNode;
}

export function $createLockNode(className, users, locker, timestamp) {
  const lockNode = new LockNode(className, users, locker, timestamp);
  return lockNode;
}

export function isLockedNode(_node, user) {
  let validationFlag = false;
  const parents = _node.getParents();
  parents
    .filter((element) => $isLockNode(element))
    .map((elementNode) => {
      const unlockedUsers = elementNode.getUsers();
      if (!unlockedUsers.includes(user)) {
        validationFlag = true;
        return false;
      }
    });
  return validationFlag;
}

function clickLockBtn() {
  const lockBtn = document.getElementById('lock-btn');
  lockBtn.click();
}

const debouncedClickLockBtn = debounce(clickLockBtn, 100);
