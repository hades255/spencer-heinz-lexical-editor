import { useEffect } from 'react';
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

const processJson = (jsonData) => {
  for (let key in jsonData) {
    // if (jsonData.hasOwnProperty(key)) {
    if (typeof jsonData[key] === 'object') {
      processJson(jsonData[key]);
    }
    if (key === 'type' && (jsonData[key] === 'comment' || jsonData[key] === 'lock' || jsonData[key] === 'black-out')) {
      jsonData[key] = 'paragraph';
      delete jsonData['className'];
      delete jsonData['comments'];
      delete jsonData['newOrUpdated'];
    }
    // }
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
            const lexicalString = $getLexicalContent(editor);
            console.log(lexicalString);
            if (type === 'json') {
              const nodes = selection.extract();
              let nNodes = [];
              let pastNode = null;
              let ntype = '';
              let ltype = '';
              for (let node of nodes) {
                ntype = node.getType();
                if (ntype === 'black-out') continue;
                if (ntype === 'comment' || ntype === 'lock') {
                  ltype = 'merge';
                  pastNode = node;
                } else {
                  if (ltype === 'merge') {
                    ltype = '';
                    nNodes.push({
                      ...node,
                      __parent: pastNode.__parent,
                      __prev: pastNode.__prev,
                      __next: pastNode.__next,
                      __key: pastNode.__key
                    });
                  } else {
                    nNodes.push(node);
                  }
                }
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
          const data = processJson(editor.toJSON());
          downloadTextFile(JSON.stringify(data), `Editor-${name}-${Date.now()}.json`);
        },
        EditorPriority
      )
    );
  }, [editor]);

  return null;
}

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
