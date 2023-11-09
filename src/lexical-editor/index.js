import { memo, useEffect, useState } from 'react';
// material-ui
import { CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
// project import
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import LexicalTheme from './utils/theme';
import './styles/editor.css';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { $getRoot, $createParagraphNode, $createTextNode, $getNodeByKey, TextNode } from 'lexical';
import PropTypes from 'prop-types';
import { HistoryPlugin } from './plugins/lexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LocalStoragePlugin } from 'Plugins/localstorage-plugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ActionsPlugin } from './plugins/actionsPlugin';
import { NodeEventPlugin } from '@lexical/react/LexicalNodeEventPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { useEditorHistoryState } from 'contexts/LexicalEditor';
import { v4 as uuidv4 } from 'uuid';
import { CommentNode } from './nodes/commentNode';
import CommentPlugin, { TOUCH_COMMENT_COMMAND } from './plugins/commentPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { FloatMenuPlugin } from './plugins/floatMenuPlugin';
import ToolbarPlugin from './plugins/toolbarPlugin';
import { LockPlugin } from './plugins/lockPlugin';
import { LockNode } from './nodes/lockNode';
import { useSelector } from 'store';
import { BlackoutNode, isBlackedOutNode } from './nodes/blackoutNode';
import { BlackoutPlugin } from './plugins/blackoutPlugin';
import { EVENT_STATUS } from './utils/constants';
import { LinearProgress } from '@mui/material';
import { $createCustomTextNode, CustomTextNode } from './nodes/customTextNode';
import { JumpNode } from './nodes/jumpNode';
import { JumpPlugin } from './plugins/jumpPlugin';
import { dispatch } from 'store';
import { getUserLists } from 'store/reducers/user';

// set excluded properties for collab
const excludedProperties = new Map();
excludedProperties.set(CommentNode, new Set(['__suppressed', '__currentUser']));
excludedProperties.set(LockNode, new Set(['__currentUser']));

const LexicalEditor = ({ uniqueId, user, allUsers }) => {
  const { historyState } = useEditorHistoryState();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    CustomTextNode.setCurrentUser(user._id);
  }, [user]);

  // useEffect(() => {
  //   dispatch(getUserLists());
  // }, []);

  const EDITOR_NAMESPACE = uniqueId;
  const EDITOR_NODES = [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    AutoLinkNode,
    LinkNode,
    CommentNode,
    LockNode,
    BlackoutNode,
    JumpNode,
    CustomTextNode,
    {
      replace: TextNode,
      with: (node) => {
        return $createCustomTextNode(node.getTextContent());
      }
    }
  ];

  const config = {
    editable: true,
    namespace: EDITOR_NAMESPACE,
    nodes: EDITOR_NODES,
    editorState: null,
    theme: LexicalTheme,
    onError: (error) => {
      console.log(error);
    }
  };
  return (
    <LexicalComposer initialConfig={config}>
      <NodeEventPlugin
        nodeType={CommentNode}
        eventType={'click'}
        eventListener={(e, editor, nodeKey) => {
          const _commentNode = $getNodeByKey(nodeKey);
          if (!isBlackedOutNode(_commentNode, user._id)) editor.dispatchCommand(TOUCH_COMMENT_COMMAND, nodeKey);
        }}
      />
      <ToolbarPlugin user={user._id} users={allUsers} />
      {!isLoading ? (
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="editor-input" rows={40} spellCheck={true} style={{ height: '70vh', overflowY: 'scroll' }} />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      ) : (
        <LinearProgress />
      )}
      <HistoryPlugin externalHistoryState={historyState} />
      <CollaborationPlugin
        id={uniqueId}
        providerFactory={(id, yjsDocMap) => {
          const doc = new Y.Doc();
          const permanentUserData = new Y.PermanentUserData(doc);
          permanentUserData.setUserMapping(doc, doc.clientID, user._id);
          yjsDocMap.set(id, doc);
          const serviceToken = window.localStorage.getItem('serviceToken');
          const provider = new WebsocketProvider(process.env.REACT_APP_YSOCKET_URL || 'ws://localhost:8000/document/connect', id, doc, {
            params: { token: serviceToken }
          });
          provider.on('status', (event) => {
            console.log('event.status: ', event.status);
            if (event.status === EVENT_STATUS.CONNECTED) {
              setIsLoading(false);
            }
          });
          provider.awareness.on('change', ({ added, removed, updated }) => {
            // console.log('state updated:', updated);
            // console.log('These users connected:', added);
            // console.log('These users disconnected:', removed);
            // console.log('All user states:', provider.awareness.getStates());
            // console.log(provider._updateHandler());
          });
          return provider;
        }}
        key={uuidv4()}
        initialEditorState={initialEditorState}
        username={user.name}
        shouldBootstrap={true}
        excludedProperties={excludedProperties}
      />
      <ListPlugin />
      <LinkPlugin />
      <LocalStoragePlugin namespace={EDITOR_NAMESPACE} />
      <AutoFocusPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      {/* custom plugins */}
      <ActionsPlugin user={user._id} />
      <CommentPlugin user={user._id} users={allUsers} />
      <FloatMenuPlugin users={allUsers} />
      <LockPlugin user={user._id} users={allUsers} />
      <BlackoutPlugin user={user._id} users={allUsers} />
      <JumpPlugin />
    </LexicalComposer>
  );
};

LexicalEditor.propTypes = {
  uniqueId: PropTypes.string,
  user: PropTypes.object
};

function initialEditorState() {
  const root = $getRoot();
  const paragraph = $createParagraphNode();
  const text = $createTextNode('');
  paragraph.append(text);
  root.append(paragraph);
}

export default memo(LexicalEditor);
