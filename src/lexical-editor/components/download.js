import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack
} from '@mui/material';
import { useSelector } from 'store';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CloseCircleOutlined, FormOutlined } from '@ant-design/icons';
import { $nodesOfType, createCommand } from 'lexical';
import { JsontagNode } from 'lexical-editor/nodes/jsontagNode';
import { mergeRegister } from '@lexical/utils';
import { downloadTextFile } from './floatMenu/download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { BootstrapTooltip } from 'components/ToolTip';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

const EditorPriority = 1;

export const SELECT_DOWNLOAD_FORMAT = createCommand('SELECT_DOWNLOAD_FORMAT');

export default function Download({ user }) {
  const doc = useSelector((state) => state.document.document);
  const [showDropDown, setShowDropDown] = useState(false);
  const [type, setType] = useState('json');
  const anchorRef = useRef(null);
  const [editor] = useLexicalComposerContext();
  const [displayData, setDisplayData] = useState(null);

  const handleClose = useCallback((event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setShowDropDown(false);
  }, []);

  const handleDownload = useCallback(() => {
    // editor.dispatchCommand(DOWNLOAD_ALL_JSON, { type, name: doc.name });
    downloadTextFile(displayData, `Editor-${doc.name}-${Date.now()}.${type === 'tags' ? 'json' : type}`);
    // if (anchorRef.current && anchorRef.current.contains(event.target)) {
    //   return;
    // }
    // setShowDropDown(false);
  }, [type, doc, displayData]);

  const handleCopy = useCallback(() => {
    (async () => {
      try {
        const data = [
          new ClipboardItem({
            ['text/plain']: new Blob([displayData], { type: 'text/plain' })
          })
        ];
        console.log(data);
        await navigator.clipboard.write(data);
      } catch (error) {
        console.log(error);
        dispatch(
          openSnackbar({
            open: true,
            message: 'You have to set permission to clipboard on this browser',
            variant: 'alert',
            alert: {
              color: 'warning'
            },
            close: true
          })
        );
      }
    })();
  }, [displayData]);

  const handleRadioChange = useCallback((event) => {
    setType(event.target.value);
  }, []);

  useEffect(() => {
    if (showDropDown) editor.dispatchCommand(SELECT_DOWNLOAD_FORMAT, { type });
  }, [showDropDown, type, editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECT_DOWNLOAD_FORMAT,
        ({ type }) => {
          console.log(type);
          if (type === 'json') {
            const data = editor.toJSON();
            setDisplayData(JSON.stringify(data, null, 2));
          }
          if (type === 'tags') {
            const nodes = $nodesOfType(JsontagNode);
            let data = {};
            nodes.forEach((node) => {
              if (data[node.__uniqueId]) {
                data[node.__uniqueId] = {
                  key: node.__tag,
                  value: data[node.__uniqueId].value + ' ' + node.getTextContent()
                };
              } else {
                data[node.__uniqueId] = {
                  key: node.__tag,
                  value: node.getTextContent()
                };
              }
            });
            let res = [];
            for (let key in data) {
              res.push({
                [data[key].key]: data[key].value
              });
            }
            setDisplayData(JSON.stringify(res, null, 2));
          }
          if (type === 'html') {
            // const data = $generateHtmlFromNodes(editor);
          }
        },
        EditorPriority
      )
    );
  }, [editor]);

  return (
    doc &&
    doc.creator._id === user && (
      <>
        <IconButton
          size="large"
          icon="link"
          aria-label="more"
          id={`download-button-0`}
          aria-controls={open ? `long-menu-0` : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={() => setShowDropDown(!showDropDown)}
          ref={anchorRef}
        >
          <FormOutlined />
        </IconButton>
        <Dialog
          open={showDropDown}
          fullWidth
          onClose={(r) => {
            if (r === 'escapeKeyDown') setShowDropDown(false);
          }}
          sx={{ zIndex: 1201 }}
        >
          <IconButton size="small" sx={{ position: 'absolute', top: 11, right: 11 }} onClick={handleClose}>
            <CloseCircleOutlined style={{ fontSize: '1.15rem' }} />
          </IconButton>
          <DialogTitle>Download</DialogTitle>
          <DialogContent>
            <Stack px={2} direction={'row'} justifyContent={'space-between'}>
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="json"
                  value={type}
                  onChange={handleRadioChange}
                  name="radio-buttons-group"
                >
                  <Stack direction={'row'}>
                    <FormControlLabel value="json" control={<Radio />} label="Document" />
                    <FormControlLabel value="tags" control={<Radio />} label="JSON tags and data" />
                  </Stack>
                </RadioGroup>
              </FormControl>
              <ButtonGroup>
                <BootstrapTooltip title="copy" placement="top" onClick={handleCopy}>
                  <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                    <ContentCopyIcon />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip title="download" placement="top">
                  <IconButton size="small" color="primary" onClick={handleDownload}>
                    <DownloadIcon />
                  </IconButton>
                </BootstrapTooltip>
              </ButtonGroup>
            </Stack>
            <Box sx={{ mt: 1, height: 500, overflowY: 'scroll', border: 'solid rgba(100,100,100,0.2) 1px', borderRadius: 2, p: 1 }}>
              {displayData && <pre>{displayData}</pre>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Box px={3}>
              <Button size="small" color="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button size="small" onClick={handleDownload}>
                Download
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </>
    )
  );
}

Download.propTypes = {
  user: PropTypes.string
};
