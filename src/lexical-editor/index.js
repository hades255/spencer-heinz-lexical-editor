import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import CommentPlugin, { MOUSE_ENTER_BLACKOUT_NODE, MOUSE_ENTER_COMMAND, TOUCH_COMMENT_COMMAND } from './plugins/commentPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { FloatMenuPlugin } from './plugins/floatMenuPlugin';
import ToolbarPlugin from './plugins/toolbarPlugin';
import { LockPlugin } from './plugins/lockPlugin';
import { LockNode, canTouchLockedNode, isLockedNode } from './nodes/lockNode';
import { BlackoutNode, isBlackedOutNode } from './nodes/blackoutNode';
import { BlackoutPlugin } from './plugins/blackoutPlugin';
import { EVENT_STATUS } from './utils/constants';
import { Box, LinearProgress } from '@mui/material';
import { $createCustomTextNode, CustomTextNode } from './nodes/customTextNode';
import { JumpNode } from './nodes/jumpNode';
import { JumpPlugin } from './plugins/jumpPlugin';
import ActiveTeamPlugin from './plugins/activeTeamPlugin';
import FocusPlugin from './plugins/focusPlugin';
import { JsontagNode } from './nodes/jsontagNode';
import { JsontagPlugin, TOUCH_JSONTAG_NODE } from './plugins/jsontagPlugin';

// set excluded properties for collab
const excludedProperties = new Map();
excludedProperties.set(CommentNode, new Set(['__suppressed', '__currentUser']));
excludedProperties.set(LockNode, new Set(['__currentUser']));

const LexicalEditor = ({ uniqueId, user }) => {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location]);

  const { historyState } = useEditorHistoryState();

  const [isLoading, setIsLoading] = useState(true);
  const [filteredUser, setFilteredUser] = useState('');
  // const [provider, setProvider] = useState(null);

  useEffect(() => {
    CustomTextNode.setCurrentUser(user._id);
    JsontagNode.setCurrentUser(user._id);
  }, [user]);

  const handleProvider = useCallback(
    (id, yjsDocMap) => {
      const doc = new Y.Doc();
      const permanentUserData = new Y.PermanentUserData(doc);
      permanentUserData.setUserMapping(doc, doc.clientID, user._id);
      yjsDocMap.set(id, doc);
      const serviceToken = window.localStorage.getItem('serviceToken');
      // console.log('connecting to Y server');
      const provider = new WebsocketProvider(process.env.REACT_APP_YSOCKET_URL || 'ws://192.168.148.86:8000/document/connect', id, doc, {
        params: { token: serviceToken }
      });
      provider.on('status', (event) => {
        // console.log('event.status: ', event.status);
        if (event.status === EVENT_STATUS.CONNECTED) {
          setIsLoading(false);
        }
      });
      // provider.awareness.on('change', ({ added, removed, updated }) => {
      provider.awareness.on('change', () => {
        // console.log('state updated:', updated);
        // console.log('These users connected:', added);
        // console.log('These users disconnected:', removed);
        // console.log('All user states:', provider.awareness.getStates());
        // console.log(provider._updateHandler());
      });
      return provider;
    },
    [user]
  );

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
    JsontagNode,
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

  const handleCopy = useCallback(() => {
    // const permissionStatus = localStorage.getItem('clipboard');
    // if (permissionStatus != 'granted')
    // e.preventDefault();
  }, []);

  useEffect(() => {
    let timer = null;
    let cnt = 0;
    if (searchParams.get('comment') && !isLoading) {
      const timerFunc = () => {
        if (document.querySelector(`[data-comments*="${searchParams.get('comment')}"]`)) {
          const element = document.querySelector(`[data-comments*="${searchParams.get('comment')}"]`);
          const comments = JSON.parse(element.dataset.comments) || [];
          const comment = comments.find((comment) => comment.uniqueId === searchParams.get('comment'));
          if (searchParams.get('group') === 'asks' && user._id && comment.commentor && comment.commentor._id) {
            if (comment.assignee === user._id) setFilteredUser(comment.commentor._id);
            if (comment.commentor._id === user._id) setFilteredUser(comment.assignee);
          }
          document
            .querySelector(`[data-comments*="${searchParams.get('comment')}"]`)
            .scrollIntoView({ behavior: 'smooth', block: 'center' });
          document.querySelector(`[data-comments*="${searchParams.get('comment')}"]`).focus();
        } else {
          if (cnt > 20) return;
          timer = setTimeout(() => {
            timerFunc();
          }, 100);
          cnt++;
        }
      };
      setTimeout(() => {
        timer = timerFunc();
      }, 100);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, searchParams, user]);

  return (
    <LexicalComposer initialConfig={config}>
      <NodeEventPlugin
        nodeType={LockNode}
        eventType={'contextmenu'}
        eventListener={(e, editor, nodeKey) => {
          const _lockedNode = $getNodeByKey(nodeKey);
          if (!(canTouchLockedNode(_lockedNode, user._id) && !isLockedNode(_lockedNode, user._id))) {
            e.preventDefault();
          }
        }}
      />
      <NodeEventPlugin
        nodeType={CommentNode}
        eventType={'click'}
        eventListener={(e, editor, nodeKey) => {
          const _commentNode = $getNodeByKey(nodeKey);
          if (!isBlackedOutNode(_commentNode, user._id)) editor.dispatchCommand(TOUCH_COMMENT_COMMAND, nodeKey);
        }}
      />
      <NodeEventPlugin
        nodeType={CommentNode}
        eventType={'mouseenter'}
        eventListener={(e, editor, nodeKey) => {
          const _commentNode = $getNodeByKey(nodeKey);
          if (!isBlackedOutNode(_commentNode, user._id)) editor.dispatchCommand(MOUSE_ENTER_COMMAND, { e, nodeKey });
        }}
      />
      <NodeEventPlugin
        nodeType={BlackoutNode}
        eventType={'mouseenter'}
        eventListener={(e, editor, nodeKey) => {
          const classList = e.target.classList;
          if (
            classList.contains(LexicalTheme.blackoutIcon) &&
            (classList.contains(LexicalTheme.requestPermissionIcon) || classList.contains(LexicalTheme.requestPermissionIconUntouched))
          ) {
            editor.dispatchCommand(MOUSE_ENTER_BLACKOUT_NODE, { e, nodeKey });
          }
        }}
      />
      <NodeEventPlugin
        nodeType={JsontagNode}
        eventType={'click'}
        eventListener={(e, editor, nodeKey) => {
          editor.dispatchCommand(TOUCH_JSONTAG_NODE, { e, nodeKey });
        }}
      />
      <ToolbarPlugin user={user} filteredUser={filteredUser} />
      <Box sx={{ height: '65vh' }}>
        {!isLoading ? (
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                rows={40}
                spellCheck={true}
                style={{ height: '100%', overflowY: 'scroll' }}
                onCopy={handleCopy}
                onCut={handleCopy}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        ) : (
          <LinearProgress />
        )}
      </Box>
      <HistoryPlugin externalHistoryState={historyState} />
      <CollaborationPlugin
        id={uniqueId}
        providerFactory={handleProvider}
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
      <CommentPlugin user={user._id} uniqueId={uniqueId} />
      <FloatMenuPlugin />
      <LockPlugin user={user._id} />
      <BlackoutPlugin user={user._id} />
      <JumpPlugin />
      <JsontagPlugin />
      <ActiveTeamPlugin />
      <FocusPlugin user={user._id} />
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
