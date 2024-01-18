import { useEffect } from 'react';
import lexical, { COPY_COMMAND, $getSelection, $getRoot } from 'lexical';
import selection from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import { $generateHtmlFromNodes } from '@lexical/html';
import { mergeRegister } from '@lexical/utils';
import { CommentNode } from 'lexical-editor/nodes/commentNode';

const EditorPriority = 1;

function findCommentNodeWithId(editor, selection, uniqueId) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error(
      'To use findCommentNodeWithId in headless mode please initialize a headless browser implementation such as JSDom before calling this function.'
    );
  }

  const root = $getRoot();
  const topLevelChildren = root.getChildren();

  for (let i = 0; i < topLevelChildren.length; i++) {
    const topLevelNode = topLevelChildren[i];
    const n = findCommentNode(editor, topLevelNode, selection, uniqueId);
    if (n) return n;
  }
  return false;
}

function findCommentNode(editor, currentNode, selection$1 = null, uniqueId) {
  let shouldInclude = selection$1 != null ? currentNode.isSelected(selection$1) : true;
  // console.log(currentNode);
  //   if (currentNode.__type === 'comment') console.log(currentNode.getComments()[0].uniqueId);
  if (currentNode.__type === 'comment' && currentNode.getComments().find((item) => item.uniqueId === uniqueId)) {
    return currentNode;
  }
  let target = currentNode;

  if (selection$1 !== null) {
    let clone = selection.$cloneWithProperties(currentNode);
    clone = lexical.$isTextNode(clone) && selection$1 != null ? selection.$sliceSelectedTextNodeContent(selection$1, clone) : clone;
    target = clone;
  }

  const children = lexical.$isElementNode(target) ? target.getChildren() : [];
  for (let i = 0; i < children.length; i++) {
    const childNode = children[i];
    const shouldIncludeChild = findCommentNode(editor, childNode, selection$1, uniqueId);
    if (typeof shouldIncludeChild === 'object') return shouldIncludeChild;

    if (
      !shouldInclude &&
      lexical.$isElementNode(currentNode) &&
      shouldIncludeChild &&
      currentNode.extractWithChild(childNode, selection$1, 'html')
    ) {
      shouldInclude = true;
    }
  }

  return shouldInclude;
}

export default function FocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([CommentNode])) {
      throw new Error('CommentPlugin: CommentNode not registered on editor');
    }
    editor.registerUpdateListener(({ editorState }) => {
      //   const editorState = editor.getEditorState();
      editorState.read(() => {
        //   const root = $getRoot();
        //   console.log(root.getNodes());
        //   $getRoot().select();
        const selection = $getSelection();
        if (selection === null) {
          const comment = findCommentNodeWithId(editor, selection, '2fc542ad-0769-4c36-908b-a0420ad6b973');
          console.log(comment);
          if (typeof comment === 'object') {
            console.log(comment);
            // editor.update((change) => {
            //   $setSelection({ anchor: { path: [3, 4], offset: 4 }, focus: { path: [3, 4], offset: 4 } });
            // });
          }
        }
      });
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        COPY_COMMAND,
        () => {
          navigator.clipboard.read().then((clipboardItems) => {
            (async () => {
              try {
                const clipboardItem = clipboardItems[0];
                const _html = await clipboardItem.getType('text/html');
                const html = await _html.text();
                // console.log(html);
                // const res = html.replace(/<img[^>]*>/g, '');
                const div = document.createElement('div');
                div.innerHTML = html;
                div.querySelectorAll('[data-lexical-comment="true"]').forEach((element) => {
                  element.remove();
                });
                div.querySelectorAll('[data-lexical-black-out="true"]').forEach((element) => {
                  element.remove();
                });
                div.querySelectorAll('[data-lexical-jump="true"]').forEach((element) => {
                  element.remove();
                });
                div.querySelectorAll('[data-lexical-lock="true"]').forEach((element) => {
                  element.remove();
                });
                const data = [
                  new ClipboardItem({
                    ['text/html']: new Blob([div.innerHTML], { type: 'text/html' }),
                    ['text/plain']: new Blob([div.innerText], { type: 'text/plain' })
                  })
                ];
                // console.log(data);
                await navigator.clipboard.write(data);
              } catch (error) {
                console.log(error);
              }
            })();
          });
          return true;
        },
        EditorPriority
      )
    );
  }, [editor]);

  return null;
}
