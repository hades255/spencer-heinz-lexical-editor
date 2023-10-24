import { LockNode } from 'lexical-editor/nodes/lockNode';
import { useEffect } from 'react';

function useLockTransform(editor) {
  useEffect(() => {
    const removeLockNodeTransform = editor.registerNodeTransform(LockNode, (node) => {
      if (node.getTextContent() === 'blue') {
        node.setTextContent('green');
      }
    });
    return () => {
      removeLockNodeTransform();
    };
  }, [editor]);

  return null;
}

export default useLockTransform;
