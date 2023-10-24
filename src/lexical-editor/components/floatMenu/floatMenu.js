/* eslint-disable prettier/prettier */
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { inRange, isUndefined } from 'lodash';
import DropDownMenu from '../../components/floatMenu/dropdown';
import PropTypes from 'prop-types';

let setPosTimeout = 0;
const FloatMenu = ({ show, ...props }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState(undefined);
  const [step, setStep] = useState(0);
  const [mousePos, SetMousePos] = useState({ x: undefined, y: undefined, traveL: 0 });
  const [mouseToMenu, setMouseToMenu] = useState(false);
  const [mouseSelecting, setMouseSelecting] = useState(false);

  const nativeSel = window.getSelection();
  const lastPoint = { x: null, y: null, travel: 0 };

  useEffect(() => {
    document.addEventListener('mousemove', (event) => {
      let mousetravel = Math.abs(event.clientY - lastPoint.y);
      SetMousePos({ x: event.clientX, y: event.clientY, travel: mousetravel });
      setMouseToMenu(false);
      lastPoint.x = event.clientX;
      lastPoint.y = event.clientY;
    });
    document.addEventListener('mousedown', (event) => {
      if (!ref.current || !ref.current.contains(event.target)) {
        setMouseSelecting(true);
      }
    });
    document.addEventListener('mouseup', () => {
      setMouseSelecting(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setStep(0);
    const isCollapsed = nativeSel?.rangeCount === 0 || nativeSel?.isCollapsed;

    if (!show || !ref.current || !nativeSel || isCollapsed) {
      clearTimeout(setPosTimeout);
      setPos(undefined);
      return;
    }
    const domRange = nativeSel.getRangeAt(0);
    const SelectedRects = domRange.getClientRects();
    var SelectedRectArray = Array.prototype.slice.call(SelectedRects);
    let activeReactY = undefined;
    SelectedRectArray.map((rect) => {
      if (
        (inRange(mousePos.y, rect.top - 10, rect.bottom + 10) && inRange(mousePos.x, rect.left - 10, rect.right + 20)) ||
        props.isDropDownActive
      ) {
        activeReactY = rect.top;
      }

      return false;
    });
    let doc = document.documentElement;
    let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
    let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);
    clearTimeout(setPosTimeout);
    if (isUndefined(pos?.x) || isUndefined(pos?.y)) {
      setPosTimeout = setTimeout(() => {
        setPos({ x: mousePos.x + left - 10, y: activeReactY + top - 20 });
      }, 100);
    } else {
      setPos({ x: mousePos.x + left - 10, y: activeReactY + top - 20 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, nativeSel, nativeSel?.anchorOffset]);

  useEffect(() => {
    const isCollapsed = nativeSel?.rangeCount === 0 || nativeSel?.isCollapsed;

    if (!show || !ref.current || !nativeSel || isCollapsed) {
      clearTimeout(setPosTimeout);
      setPos(undefined);
      return;
    }

    const domRange = nativeSel.getRangeAt(0);
    domRange.cloneContents();
    const SelectedRects = domRange.getClientRects();
    var SelectedRectArray = Array.prototype.slice.call(SelectedRects);

    // check if mouse is in the selection boundary

    let isMouseInRect = false;
    let activeReactY = undefined;
    SelectedRectArray.map((rect) => {
      if (
        (inRange(mousePos.y, rect.top - 10, rect.bottom + 10) && inRange(mousePos.x, rect.left - 10, rect.right + 20)) ||
        props.isDropDownActive
      ) {
        activeReactY = rect.top;
        isMouseInRect = true;
      }

      return false;
    });
    let doc = document.documentElement;
    let left = (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
    let top = (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);

    if (isMouseInRect && (!mouseSelecting || props.isDropDownActive)) {
      if ((mouseToMenu || props.isDropDownActive) && pos?.x && pos?.y) {
        return () => { };
      } else {
        clearTimeout(setPosTimeout);
        if (isUndefined(pos?.x) || isUndefined(pos?.y)) {
          setPosTimeout = setTimeout(() => {
            setPos({ x: mousePos.x + left - 10, y: activeReactY + top - 20 });
          }, 100);
        } else {
          setPos({ x: mousePos.x + left - 10, y: activeReactY + top - 20 });
        }
      }
    } else {
      clearTimeout(setPosTimeout);
      setPos({ x: undefined, y: undefined });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mousePos.x, mousePos.y, mouseSelecting]);

  const handleMouseMove = () => {
    props.setIsDropDownActive(true);
    return false;
  };

  const handleMouseLeave = () => {
    props.setIsDropDownActive(false);
    return false;
  };

  return (
    <>
      <Box
        ref={ref}
        sx={{ top: pos?.y, left: pos?.x }}
        zIndex={`10001`}
        display={!pos?.x || !pos?.y ? `none` : `flex`}
        position={`absolute`}
        alignItems={`center`}
        justifyContent={`space-between`}
        bgcolor={`white`}
        border={`1px solid black`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <DropDownMenu
          setIsDropDownActive={props.setIsDropDownActive}
          setStep={setStep}
          step={step}
          index={0}
          isDropDownActive={props.isDropDownActive}
          setAssignee={props.setAssignee}
          assignee={props.assignee}
          setTask={props.setTask}
          task={props.task}
          users={props.users}
          setDialogOpen={props.setDialogOpen}
          pos={pos}
        />
      </Box>
    </>
  );
};

FloatMenu.propTypes = {
  show: PropTypes.bool,
  isDropDownActive: PropTypes.bool,
  setIsDropDownActive: PropTypes.func,
  assignee: PropTypes.string,
  task: PropTypes.string,
  users: PropTypes.array,
  setAssignee: PropTypes.func,
  setTask: PropTypes.func,
  setDialogOpen: PropTypes.func,
};

export default FloatMenu;
