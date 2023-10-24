import { TextNode } from 'lexical';
import { $createBlackedTextNode } from 'lexical-editor/nodes/customTextNode';
import { BlackoutNode, isBlackedOutNode } from 'lexical-editor/nodes/blackoutNode';
import { useEffect } from 'react';

function useBlockedTextTransform(editor) {
  useEffect(() => {
    const removeBlockedTextTransform = editor.registerNodeTransform(TextNode, (node) => {
      // if (!node.isEditable()) {
      //   const writable = node.getWritable();
      //   const textContent = writable.getTextContent();
      //   if (/^[^█]+$/.test(textContent)) {
      //     const children = node.getChildren();
      //     children.forEach((child, index) => {
      //       const textContent = child.getTextContent();
      //       // const length = random(5, 15);
      //       // child.setTextContent(textContent.replace(/[\w\s]/g, '█'));
      //       // add 5~15 characters at the end of last node
      //       if (index === children.length - 1) {
      //         child.setTextContent('█'.repeat(textContent.length + (textContent.length % 10) + 5));
      //         return false;
      //       }
      //       child.setTextContent('█'.repeat(textContent.length));
      //     });
      //   }
      //   console.log(writable.getTextContent());
      // }
      if (isBlackedOutNode(node)) {
        console.log('blocked node');
        node.insertBefore($createBlackedTextNode(node.getTextContent()));
        node.remove();
      }
      return false;
    });
    return () => {
      removeBlockedTextTransform();
    };
  }, [editor]);

  return null;
}

export default useBlockedTextTransform;
