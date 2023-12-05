// material-ui
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  ClickAwayListener,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
// import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
// project import
import MainCard from 'components/MainCard';
import { TRANSFORMERS } from '@lexical/markdown';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorHistoryStateContext, useEditorHistoryState } from 'contexts/LexicalEditor';
import { ActionsPlugin } from 'Plugins/actions-plugin';
import { FloatingMenuPlugin } from 'Plugins/floating-menu';
import LexicalTheme from 'Plugins/utils/theme';
import ToolbarPlugin from 'Plugins/toolbar-plugin';
import '../../Plugins/styles/editor.css';
import { MentionNode } from 'Plugins/components/mention-node';
import { ParagraphNode, TextNode } from 'lexical';
import { createPortal } from 'react-dom';
import { useRef, useState } from 'react';
import { isEmpty, trim, uniqueId } from 'lodash';
import { MailFilled } from '@ant-design/icons';
import MentionPlugin from 'Plugins/mention-plugin';
import { UserTextNode } from 'Plugins/components/user-text-node';
import { LocalStoragePlugin } from 'Plugins/localstorage-plugin';
import { UserParagraphNode } from 'Plugins/components/user-paragraph-node';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { BlackOutNode } from 'Plugins/components/black-out-node';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import useAuth from 'hooks/useAuth';

export const EDITOR_NAMESPACE = 'lexical-editor';

const EDITOR_NODES = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  AutoLinkNode,
  LinkNode,
  MentionNode,
  UserTextNode,
  BlackOutNode,
  UserParagraphNode
];

// ==============================|| SAMPLE PAGE ||============================== //

// const content = localStorage.getItem(EDITOR_NAMESPACE);

const SamplePage = () => {
  const { user: currentUser } = useAuth();

  return (
    <MainCard title="Lexical Text Editor">
      <Container>
        <Typography variant="h2">Lexical Text Editor</Typography>
        <Box>
          <Stack direction="row" spacing={2} marginY={`30px`} display={`flex`} alignItems={`center`}>
            <Typography variant="h5">Current User is: </Typography>
            <Typography variant="h5">{currentUser?.name}</Typography>
          </Stack>
          <EditorHistoryStateContext>
            <LexicalEditor
              config={{
                editable: true,
                namespace: EDITOR_NAMESPACE,
                nodes: [
                  ...EDITOR_NODES,
                  {
                    replace: ParagraphNode,
                    with: () => {
                      // creator === undefined: newly created!
                      const uniqueId = uuidv4();
                      return new UserParagraphNode('user-paragraph', [], undefined, false, 0, uniqueId);
                    }
                  },
                  {
                    replace: TextNode,
                    with: (node) => {
                      // creator === undefined: newly created!
                      const uniqueId = uuidv4();
                      return new UserTextNode(
                        'user-text',
                        node.getTextContent(),
                        [],
                        [],
                        undefined,
                        false,
                        node.getFormat(),
                        undefined,
                        uniqueId
                      );
                    }
                  }
                ],
                editorState: null,
                theme: LexicalTheme,
                onError: (error) => {
                  console.log(error);
                }
              }}
              currentUser={currentUser?.name}
            />
          </EditorHistoryStateContext>
        </Box>
      </Container>
    </MainCard>
  );
};

export default SamplePage;

const Placeholder = () => {
  return <Box className="editor-placeholder">Start writing...</Box>;
};

let floatTimeOut = 0;

export const LexicalEditor = (props) => {
  const { config, currentUser } = props;
  const { historyState } = useEditorHistoryState();
  const [comments, setComments] = useState([]);
  const [activeRect, setActiveRect] = useState({ top: undefined, left: undefined });
  const [isOnFab, setIsOnFab] = useState(false);
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [activeNode, setActiveNode] = useState({});
  const [replyShow, setReplyShow] = useState({});
  const [activeReplyIndex, setActiveReplyIndex] = useState(0);
  const [carModel, setCarModel] = useState('all');
  const [isLockedShow, setIsLockedShow] = useState(true);

  const replyRef = useRef('');

  // useEffect(() => {
  //   window.addEventListener('scroll', () => {
  //     let doc = document.documentElement;
  //     // let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
  //     let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);
  //     setActiveRect({
  //       top: min([max([top + 35 * comments.length, activeRect.top - 200 + top]), window.innerHeight + top - 300]),
  //       // left: max([min([activeRect.left, window.innerWidth + left - 300]), left])
  //       left: activeRect.left
  //     });
  //   });
  // }, []);

  // useEffect(() => {
  //   if (isDialogOpen) {
  //     setReplyShow({});
  //     setTimeout(() => {
  //       if (isFunction(replyRef.current.focus)) {
  //         replyRef.current.focus();
  //       }
  //     }, 100);
  //   }
  // }, [isDialogOpen]);

  // useEffect(() => {
  //   setReplyShow({});
  //   setActiveReplyIndex(0);
  // }, [activeCommentIndex]);

  // useEffect(() => {
  //   setReplyShow({});
  //   setActiveCommentIndex(0);
  //   setActiveReplyIndex(0);
  //   if (!isOnFab) {
  //     setComments([]);
  //   }
  // }, [isOnFab]);

  const handleSubmitReply = () => {
    const _reply = replyRef.current.value;

    if (!trim(_reply)) {
      return false;
    }
    if (!isEmpty(activeNode)) {
      console.log(activeNode);
      activeNode.addReply(activeCommentIndex, trim(_reply), currentUser);
    }
    replyRef.current.value = '';
    setDialogOpen(false);
    return false;
  };

  const handleCancelReply = () => {
    setDialogOpen(false);
    floatTimeOut = setTimeout(() => {
      setIsOnFab(false);
    }, 1000);
  };

  const handleReplyKeyDown = (e) => {
    let _reply = replyRef.current.value;
    if (e.key === 'Enter' && trim(_reply)) {
      e.preventDefault();
      handleSubmitReply();
    }
    return false;
  };

  return (
    <>
      <LexicalComposer initialConfig={config}>
        <CollaborationPlugin
          id="f76ecaeb-300f-4594-b57f-8bd8e96ad650"
          providerFactory={(id, yjsDocMap) => {
            const doc = new Y.Doc();
            yjsDocMap.set(id, doc);
            const serviceToken = window.localStorage.getItem('serviceToken');
            const provider = new WebsocketProvider('ws://localhost:8000/document/connect', id, doc, {
              params: { token: serviceToken }
            });
            return provider;
          }}
          username={currentUser?.name}
          key={uniqueId()}
          // Optional initial editor state in case collaborative Y.Doc won't
          // have any existing data on server. Then it'll user this value to populate editor.
          // It accepts same type of values as LexicalComposer editorState
          // prop (json string, state object, or a function)
          initialEditorState={initialEditorState}
          shouldBootstrap={true}
        />
        {/* <NodeEventPlugin
          nodeType={UserTextNode}
          eventType={'mousemove'}
          eventListener={(e, editor, nodeKey) => {
            setActiveCommentIndex(0);
            clearTimeout(floatTimeOut);
            setIsOnFab(true);
            let doc = document.documentElement;
            let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
            let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);
            editor.getEditorState().read(() => {
              const _node = $getNodeByKey(nodeKey);
              const _comments = _node.getComments();
              setComments([..._comments]);
              setActiveNode(_node.getLatest());
            });
            let rect = e.target.getBoundingClientRect();
            setActiveRect({
              top: min([max([top + 35 * comments.length, rect.top - 200 + top]), window.innerHeight + top - 300]),
              left: max([min([rect.left + rect.width + left, window.innerWidth + left - 300]), left])
            });
          }}
        />
        <NodeEventPlugin
          nodeType={UserTextNode}
          eventType={'mouseleave'}
          eventListener={() => {
            floatTimeOut = setTimeout(() => {
              if (!isDialogOpen) {
                setIsOnFab(false);
              }
            }, 600);
          }}
        /> */}
        <Box padding={0} boxShadow={`1px 1px 10px #eee`} borderRadius={`10px`} position={`relative`}>
          <ToolbarPlugin
            carModel={carModel}
            setCarModel={setCarModel}
            currentUser={currentUser}
            isLockedShow={isLockedShow}
            setIsLockedShow={setIsLockedShow}
          />
          <Box padding={0} borderTop={`2px solid #eee`} borderRadius={`0px 0px 10px 10px`}>
            {/* Official Plugins */}
            <RichTextPlugin
              contentEditable={<ContentEditable spellCheck={false} className="editor-input" />}
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
            <ListPlugin />
            <LinkPlugin />
            <LocalStoragePlugin namespace={EDITOR_NAMESPACE} />
            <AutoFocusPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            {/* <LinkPlugin validateUrl={isValidUrl} /> */}
            {/* Custom Plugins */}
            <ActionsPlugin />
            <MentionPlugin carModel={carModel} currentUser={currentUser} isLockedShow={isLockedShow} setIsLockedShow={setIsLockedShow} />
            <FloatingMenuPlugin currentUser={currentUser} />
            {/* <TreeViewPlugin /> */}
            {/* <MentionPlugin /> */}
            {/*<LocalStoragePlugin namespace={EDITOR_NAMESPACE} />       */}
          </Box>
        </Box>
      </LexicalComposer>
      {!isEmpty(comments) &&
        createPortal(
          <>
            <Box
              sx={{ top: activeRect?.top + 10, left: activeRect?.left - 1 }}
              zIndex={`10001`}
              display={!activeRect?.left || !activeRect?.top || !isOnFab ? `none` : `flex`}
              flexDirection={`column`}
              position={`absolute`}
              alignItems={`center`}
              justifyContent={`space-between`}
              bgcolor={`white`}
              onClick={() => {
                setIsOnFab(true);
              }}
            >
              {comments.map((_comment, _index) => (
                <Paper
                  key={`comment-list-${_index}`}
                  sx={{
                    position: 'absolute',
                    left: `${25 * _index}px`,
                    top: `-${35 * _index}px`,
                    zIndex: activeCommentIndex === _index ? '10001' : comments.length - _index,
                    filter: activeCommentIndex !== _index ? 'brightness(0.75)' : '',
                    padding: '0px 10px 15px 10px',
                    width: '200px',
                    height: `300px`,
                    overflow: `auto`,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveCommentIndex(_index);
                  }}
                  onMouseLeave={() => {
                    setReplyShow({});
                    setActiveReplyIndex(0);
                    floatTimeOut = setTimeout(() => {
                      if (!isDialogOpen) {
                        setIsOnFab(false);
                      }
                    }, 600);
                  }}
                  onMouseMove={() => {
                    clearTimeout(floatTimeOut);
                    setIsOnFab(true);
                  }}
                >
                  <Grid container flexDirection={`column`} wrap={'wrap'}>
                    <Grid justifyContent="left" item xs zeroMinWidth>
                      <Grid
                        display={`flex`}
                        flexDirection={`row`}
                        justifyContent="space-between"
                        item
                        xs
                        zeroMinWidth
                        position={`sticky`}
                        paddingTop={`10px`}
                        top={`0`}
                        sx={{ backdropFilter: 'blur(5px)' }}
                      >
                        <h3
                          style={{
                            display: 'inline-block',
                            margin: 0,
                            textAlign: 'left',
                            color: '#ff4d4f',
                            borderBottom: '1px solid #fafafb'
                          }}
                        >
                          {_comment.car}, {_comment.color}
                        </h3>
                        <IconButton
                          onClick={() => {
                            setReplyShow((prev) => ({ ...prev, [_index]: !prev[_index] }));
                          }}
                          disabled={activeCommentIndex !== _index || !_comment['replies']?.length}
                        >
                          <Badge badgeContent={_comment['replies']?.length ?? 0} color="error">
                            <MailFilled width={`30px`} color={'action'} />
                          </Badge>
                        </IconButton>
                      </Grid>
                      <p style={{ textAlign: 'left', fontSize: '1.1rem', wordWrap: 'break-word' }}>{_comment.comment}</p>
                      <p style={{ textAlign: 'left', color: 'gray', fontSize: '0.7rem' }}>
                        <strong>From {_comment.commentor}</strong> {new Date(_comment.date).toLocaleString()}
                      </p>
                    </Grid>
                    <Grid justifyContent="end" item>
                      <Button
                        variant={'outlined'}
                        sx={{ paddingX: '0' }}
                        size={'small'}
                        disabled={activeCommentIndex !== _index}
                        onClick={() => {
                          setDialogOpen(true);
                        }}
                      >
                        Reply
                      </Button>
                    </Grid>
                  </Grid>
                  {replyShow[_index] && (
                    <ClickAwayListener
                      onClickAway={() => {
                        setReplyShow((prev) => ({ ...prev, [_index]: false }));
                      }}
                    >
                      <Card
                        className={'reply-card'}
                        sx={{
                          position: 'absolute',
                          width: 150,
                          height: 200,
                          top: '45px',
                          left: '25px',
                          wordWrap: 'break-word',
                          overflowY: 'auto'
                        }}
                      >
                        <CardContent>
                          {_comment['replies'].map((_reply, _replyIndex) => (
                            <Box key={`reply-${_replyIndex}`} sx={{ borderBottom: '0.5px solid #8c8c8c' }}>
                              <Typography variant="h5" component="div">
                                {_reply['content']}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5 }} color="text.secondary">
                                <strong>From {_reply['replier']}</strong> {new Date(_reply['date']).toLocaleString()}
                              </Typography>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </ClickAwayListener>
                  )}
                </Paper>
              ))}
            </Box>
          </>,
          document.body
        )}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        sx={{ zIndex: 10002 }}
      >
        <DialogTitle>Reply</DialogTitle>
        <DialogContent>
          <TextField
            id="outlined-multiline-static"
            label="Write here..."
            multiline
            rows={4}
            defaultValue=""
            inputRef={replyRef}
            margin={`dense`}
            onKeyDown={(e) => handleReplyKeyDown(e)}
            focused={isDialogOpen}
          />
        </DialogContent>
        <DialogActions>
          <Button size="small" color="error" onClick={handleCancelReply}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSubmitReply}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

function initialEditorState() {
  const root = $getRoot();
  const paragraph = $createParagraphNode();
  const text = $createTextNode('Welcome to collab!');
  paragraph.append(text);
  root.append(paragraph);
}
/*
function LexicalEditor1({ config, currentUser }) {
  const { historyState } = useEditorHistoryState();
  const [comments, setComments] = useState([]);
  const [activeRect, setActiveRect] = useState({ top: undefined, left: undefined });
  const [isOnFab, setIsOnFab] = useState(false);
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [activeNode, setActiveNode] = useState({});
  const [replyShow, setReplyShow] = useState({});
  const [activeReplyIndex, setActiveReplyIndex] = useState(0);
  const [carModel, setCarModel] = useState('all');
  const [isLockedShow, setIsLockedShow] = useState(true);

  const replyRef = useRef('');

  // useEffect(() => {
  //   window.addEventListener('scroll', () => {
  //     let doc = document.documentElement;
  //     // let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
  //     let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);
  //     setActiveRect({
  //       top: min([max([top + 35 * comments.length, activeRect.top - 200 + top]), window.innerHeight + top - 300]),
  //       // left: max([min([activeRect.left, window.innerWidth + left - 300]), left])
  //       left: activeRect.left
  //     });
  //   });
  // }, []);

  // useEffect(() => {
  //   if (isDialogOpen) {
  //     setReplyShow({});
  //     setTimeout(() => {
  //       if (isFunction(replyRef.current.focus)) {
  //         replyRef.current.focus();
  //       }
  //     }, 100);
  //   }
  // }, [isDialogOpen]);

  // useEffect(() => {
  //   setReplyShow({});
  //   setActiveReplyIndex(0);
  // }, [activeCommentIndex]);

  // useEffect(() => {
  //   setReplyShow({});
  //   setActiveCommentIndex(0);
  //   setActiveReplyIndex(0);
  //   if (!isOnFab) {
  //     setComments([]);
  //   }
  // }, [isOnFab]);

  const handleSubmitReply = () => {
    const _reply = replyRef.current.value;

    if (!trim(_reply)) {
      return false;
    }
    if (!isEmpty(activeNode)) {
      console.log(activeNode);
      activeNode.addReply(activeCommentIndex, trim(_reply), currentUser);
    }
    replyRef.current.value = '';
    setDialogOpen(false);
    return false;
  };

  const handleCancelReply = () => {
    setDialogOpen(false);
    floatTimeOut = setTimeout(() => {
      setIsOnFab(false);
    }, 1000);
  };

  const handleReplyKeyDown = (e) => {
    let _reply = replyRef.current.value;
    if (e.key === 'Enter' && trim(_reply)) {
      e.preventDefault();
      handleSubmitReply();
    }
    return false;
  };

  return (
    <LexicalComposer initialConfig={config}>
      <RichTextPlugin contentEditable={<ContentEditable />} placeholder={<div>Enter some text...</div>} />
      <CollaborationPlugin
        id="yjs-plugin"
        providerFactory={(id, yjsDocMap) => {
          const doc = new Y.Doc();
          yjsDocMap.set(id, doc);
          const provider = new WebsocketProvider('ws://localhost:8000/document/connect', id, doc);
          return provider;
        }}
        // Optional initial editor state in case collaborative Y.Doc won't
        // have any existing data on server. Then it'll user this value to populate editor.
        // It accepts same type of values as LexicalComposer editorState
        // prop (json string, state object, or a function)
        initialEditorState={initialEditorState}
        shouldBootstrap={true}
      />
    </LexicalComposer>
  );
}
*/
