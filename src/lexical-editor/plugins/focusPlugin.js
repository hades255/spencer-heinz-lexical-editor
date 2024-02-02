import { useEffect } from 'react';
import PropType from 'prop-types';
import { COPY_COMMAND, $getSelection, $isRangeSelection, createCommand } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { mergeRegister } from '@lexical/utils';
import { getSelectedNode } from './toolbarPlugin';
import { $getHtmlContent } from '@lexical/clipboard';
import { downloadTextFile } from 'lexical-editor/components/floatMenu/download';
import { $isBlackoutNode } from 'lexical-editor/nodes/blackoutNode';
import { $isRangeSelected } from 'lexical-editor/utils/$isRangeSelected';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

const EditorPriority = 1;

export const DOWNLOAD_SELECT_JSON = createCommand('DOWNLOAD_SELECT_JSON');
export const DOWNLOAD_ALL_JSON = createCommand('DOWNLOAD_ALL_JSON');

export default function FocusPlugin({ user }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        COPY_COMMAND,
        (event) => {
          event.preventDefault();
          const selection = $getSelection();
          const node = getSelectedNode(selection);
          const parent = node.getParent();
          const clipboardData = event.clipboardData;
          if (clipboardData === null || selection === null) {
            return false;
          }
          if (($isBlackoutNode(parent) || $isBlackoutNode(node)) && $isRangeSelected(selection)) {
            const _blackoutNode = $isBlackoutNode(parent) ? parent : node;
            const writable = _blackoutNode.getWritable();
            if (!writable.__users.includes(user)) {
              clipboardData.setData('text/plain', '');
              clipboardData.setData('text/html', ``);
              dispatch(
                openSnackbar({
                  open: true,
                  message: 'You are not authorized to read this block of text.',
                  variant: 'alert',
                  alert: {
                    color: 'info'
                  },
                  close: true
                })
              );
              return true;
            }
          }
          const nodes = selection.extract();
          let text = '';
          nodes.forEach((node) => {
            if ($isBlackoutNode(node)) {
              text += '██████████';
            } else if ($isBlackoutNode(node.getParent())) {
              text += '';
            } else {
              text += node.getTextContent();
            }
          });
          // const plainString = selection.getTextContent();
          // console.log(plainString);
          // const htmlString = $getHtmlContent(editor);
          clipboardData.setData('text/plain', text);
          clipboardData.setData('text/html', `<span>${text}</span>`);
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
          const node = getSelectedNode(selection);
          const parent = node.getParent();
          if (($isBlackoutNode(parent) || $isBlackoutNode(node)) && $isRangeSelected(selection)) {
            const _blackoutNode = $isBlackoutNode(parent) ? parent : node;
            const writable = _blackoutNode.getWritable();
            if (!writable.__users.includes(user)) {
              dispatch(
                openSnackbar({
                  open: true,
                  message: 'You are not authorized to download this block of text.',
                  variant: 'alert',
                  alert: {
                    color: 'info'
                  },
                  close: true
                })
              );
              return false;
            }
          }
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
              /**
               * start new term
               */

              /**
               * end
               */
              // const nodes = selection.extract();
              // console.log(JSON.stringify(nodes));
              // const lexicalString = $getLexicalContent(editor);
              // console.log(lexicalString);

              const htmlString = $getHtmlContent(editor);
              console.log(htmlString);

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
          if (type === 'json') {
            console.log(editor.toJSON());
            const data = processJson(editor.toJSON(), user);
            downloadTextFile(JSON.stringify(data), `Editor-${name}-${Date.now()}.json`);
          }
          if (type === 'html') {
            const data = $generateHtmlFromNodes(editor);
            downloadTextFile(data, `Editor-${name}-${Date.now()}.html`);
          }
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
