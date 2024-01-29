import { useCallback, useEffect } from 'react';
import PropType from 'prop-types';
import lexical, { COPY_COMMAND, $getSelection, $isRangeSelection, $getRoot, createCommand } from 'lexical';
import selection from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import { $generateHtmlFromNodes } from '@lexical/html';
import { mergeRegister } from '@lexical/utils';
import { CommentNode } from 'lexical-editor/nodes/commentNode';
import { getSelectedNode } from './toolbarPlugin';
import { $getHtmlContent, $getLexicalContent } from '@lexical/clipboard';
import { downloadTextFile } from 'lexical-editor/components/floatMenu/download';

const EditorPriority = 1;

export const DOWNLOAD_SELECT_JSON = createCommand('DOWNLOAD_SELECT_JSON');
export const DOWNLOAD_ALL_JSON = createCommand('DOWNLOAD_ALL_JSON');

const processJson = (jsonData, user = '') => {
  if (jsonData.type === 'black-out') {
    if (!jsonData.users.includes(user)) {
      jsonData.type = 'paragraph';
      delete jsonData['className'];
      delete jsonData['comments'];
      delete jsonData['newOrUpdated'];
      delete jsonData['users'];
      delete jsonData['locker'];
      delete jsonData['children'];
      return jsonData;
    }
  }
  for (let key in jsonData) {
    if (key === 'type' && (jsonData[key] === 'comment' || jsonData[key] === 'lock' || jsonData[key] === 'black-out')) {
      jsonData[key] = 'paragraph';
      delete jsonData['className'];
      delete jsonData['comments'];
      delete jsonData['newOrUpdated'];
      delete jsonData['users'];
      delete jsonData['locker'];
    }
    if (typeof jsonData[key] === 'object') {
      processJson(jsonData[key], user);
    }
  }
  return jsonData;
};

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

export default function FocusPlugin({ user }) {
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
        (event) => {
          event.preventDefault();
          const selection = $getSelection();
          const clipboardData = event.clipboardData;
          if (clipboardData === null || selection === null) {
            return false;
          }
          const plainString = selection.getTextContent();
          // const htmlString = $getHtmlContent(editor);
          clipboardData.setData('text/plain', plainString);
          clipboardData.setData('text/html', `<span>${plainString}</span>`);
          // console.log(clipboardData.getData('text/plain'));
          // const lexicalString = $getLexicalContent(editor);
          // clipboardData.setData('application/x-lexical-editor', lexicalString);
          // clipboardData.setData('application/x-lexical-editor', 'lexicalString');
          // clipboardData.setData('text/plain', plainString);
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        DOWNLOAD_SELECT_JSON,
        ({ type, name }) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // const lexicalString = $getLexicalContent(editor);
            // console.log(lexicalString);
            if (type === 'json') {
              const nodes = selection.extract();
              console.log(JSON.stringify(nodes));
              let nNodes = [];
              let ntype = '';
              let key = null;
              for (let node of nodes) {
                if (key) {
                  if (node.__key !== key) {
                    continue;
                  }
                  key = null;
                }
                ntype = node.getType();
                if (ntype === 'black-out') {
                  if (!node.__users.includes(user)) {
                    key = node.__next;
                  }
                  continue;
                }
                if (ntype === 'comment' || ntype === 'lock') {
                  continue;
                }
                nNodes.push(node);
              }
              downloadTextFile(JSON.stringify(nNodes), `Editor-${name}-${Date.now()}.json`);
            } else {
              const htmlString = $getHtmlContent(editor);
              downloadTextFile(htmlString, `Editor-${name}-${Date.now()}.html`);
            }
          }
          return true;
        },
        EditorPriority
      ),
      editor.registerCommand(
        DOWNLOAD_ALL_JSON,
        ({ type, name }) => {
          console.log(editor.toJSON());
          const data = processJson(editor.toJSON(), user);
          downloadTextFile(JSON.stringify(data), `Editor-${name}-${Date.now()}.json`);
        },
        EditorPriority
      )
    );
  }, [editor, user]);

  return null;
}

FocusPlugin.propTypes = {
  user: PropType.any
};

/*
(async () => {
  try {
    const permissionStatus = localStorage.getItem('clipboard');
    if (permissionStatus != 'granted') return;
    const clipboardItems = await navigator.clipboard.read();
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
        ['text/html']: new Blob([plainString], { type: 'text/html' }),
        ['text/plain']: new Blob([plainString], { type: 'text/plain' })
      })
    ];
    // console.log(data);
    await navigator.clipboard.write(data);
  } catch (error) {
    console.log(error);
  }
})();
*/
