import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import { MenuList, Paper } from '@mui/material';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useSelector } from 'store';
import { DOWNLOAD_SELECT_JSON } from 'lexical-editor/plugins/focusPlugin';
import { FormOutlined } from '@ant-design/icons';

export function downloadTextFile(textContent, fileName) {
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  link.click();
}

export default function DownloadDropdownMenu({ setIsDropDownActive, isDropDownActive, pos }) {
  const doc = useSelector((state) => state.document.document);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!isDropDownActive || !pos?.x || !pos?.y) {
      setIsDropDownActive(false);
      setAnchorEl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropDownActive, pos?.x, pos?.y]);

  const handleClick = (event) => {
    if (open) {
      setAnchorEl(null);
    } else {
      setIsDropDownActive(true);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = useCallback(
    (type) => {
      // if (type === 'json') {
      editor.dispatchCommand(DOWNLOAD_SELECT_JSON, { type, name: doc.name });
      // const editorState = editor.getEditorState();
      // editorState.read(() => {
      //   // const lexicalString = $getLexicalContent(editor);
      //   // console.log(lexicalString);
      //   const selection = $getSelection();
      //   console.log(selection.getTextContent());
      //   const json = JSON.stringify(selection.getNodes());
      //   downloadTextFile(json, `lexical-${doc.name}.json`);
      // });
      // } else if (type === 'html') {
      //   const range = window.getSelection().getRangeAt(0);
      //   const selectedContent = range.cloneContents();
      //   const div = document.createElement('div');
      //   div.appendChild(selectedContent.cloneNode(true));
      //   const html = div.innerHTML;
      //   downloadTextFile(html, `lexical-${doc.name}.html`);
      // }
      setIsDropDownActive(false);
      setAnchorEl(null);
    },
    [editor, doc, setIsDropDownActive]
  );

  return (
    <div>
      <IconButton
        aria-label="more"
        id={`long-button-0`}
        aria-controls={open ? `long-menu-0` : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        color={`info`}
      >
        {/* <DownloadIcon color={`info`} /> */}
        <FormOutlined />
      </IconButton>
      <Paper
        sx={{
          position: 'absolute',
          top: '30px',
          display: open && pos?.x && pos?.y ? 'flex' : 'none',
          width: '80px',
          paddingLeft: '4px'
        }}
      >
        <MenuList>
          <MenuItem onClick={() => handleClose('json')}>JSON</MenuItem>
          <MenuItem onClick={() => handleClose('html')}>HTML</MenuItem>
        </MenuList>
      </Paper>
    </div>
  );
}

DownloadDropdownMenu.propTypes = {
  isDropDownActive: PropTypes.bool,
  setIsDropDownActive: PropTypes.func,
  pos: PropTypes.object
};
