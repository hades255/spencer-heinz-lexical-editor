import { USER_OPTIONS } from "Plugins/constants";
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import { $createUserTextNode } from "./user-text-node";

export class BlackOutNode extends DecoratorNode {
  __className;
  __userTextNode;
  __users;

  static getType() {
    return 'black-out';
  }

  static clone(node) {
    return new BlackOutNode(node.__className, node.__userTextNode, node.__users);
  }

  setUsers(_users) {
    this.__users = _users;
    if (isEqual(USER_OPTIONS, this.__users.sort())) {
      const writable = this.getLatest().getWritable();
      writable.replace(UserTextNode.importJSON(this.__userTextNode));
    }
    return false;
  }

  addUser(user) {
    this.__users.push(user);
    return false;
  }

  getUsers() {
    return this.__users;
  }

  constructor(className, userTextNode, users, key) {
    super(key);
    this.__className = className;
    this.__userTextNode = userTextNode;
    this.__users = users;
  }

  exportJSON() {
    return {
      type: 'black-out',
      className: this.__className,
      userTextNode: this.__userTextNode,
      users: this.__users,
      version: 1
    };
  }

  static importJSON(serializedNode) {
    const node = $createBlackoutNode('block-out', serializedNode.className, serializedNode.userTextNode, serializedNode.users);
    return node;
  }

  createDOM() {
    const span = document.createElement('span');
    return span;
  }

  // eslint-disable-next-line class-methods-use-this
  updateDOM() {
    return false;
  }

  decorate() {
    return <span style={{ backgroundColor: 'black' }}>{this.__userTextNode.text}</span>;
  }
}

export function $isBlackoutNode(node) {
  return node instanceof BlackOutNode;
}

export function $createBlackoutNode(className, userTextNode, users) {
  const blackoutNode = new BlackOutNode(className, userTextNode, users);
  return $applyNodeReplacement(blackoutNode);
}
