import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { UserTextNode } from './components/user-text-node';
import { UserParagraphNode } from './components/user-paragraph-node';
import { BlackOutNode } from './components/black-out-node';

const userTextTransform = (_node, carModel, currentUser, isLockedShow) => {
  const node = _node.getLatest();
  node.setCurrentUser(currentUser);
  node.setVisible(!isLockedShow);
  const filterType = carModel === 'all' ? '' : carModel;
  node.setFilterType(filterType);
  return false;
};

function useMentions(editor, carModel, currentUser, isLockedShow) {
  useEffect(() => {
    const removeUserTextNodeTransform = editor.registerNodeTransform(UserTextNode, (node) => {
      userTextTransform(node, carModel, currentUser, isLockedShow);
    });
    const removeUserparagraphNodeTransform = editor.registerNodeTransform(UserParagraphNode, (_node) => {
      const node = _node.getLatest();
      node.setCurrentUser(currentUser);
    });
    const removeBlackoutNodeTransform = editor.registerNodeTransform(BlackOutNode, (_node) => {
      const node = _node.getLatest();
      node.setCurrentUser(currentUser);
    });
    return () => {
      removeUserTextNodeTransform();
      removeUserparagraphNodeTransform();
      removeBlackoutNodeTransform();
    };
  }, [editor, carModel, currentUser, isLockedShow]);
}

export default function MentionPlugin({ carModel, currentUser, isLockedShow }) {
  const [editor] = useLexicalComposerContext();
  useMentions(editor, carModel, currentUser, isLockedShow);
  return null;
}
