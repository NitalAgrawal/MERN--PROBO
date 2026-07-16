import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Highlighter, Quote, Heading2, Undo2, Redo2, Type
} from 'lucide-react';

const ToolBtn = ({ icon: Icon, title, onClick, active }) => (
  <button
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-1.5 rounded-md transition-all ${
      active
        ? 'bg-deep-brown text-warm-ivory'
        : 'text-warm-gray hover:text-deep-brown hover:bg-soft-beige/60'
    }`}
  >
    <Icon size={14} />
  </button>
);

const Divider = () => <div className="w-px h-4 bg-warm-gray/20 mx-0.5" />;

const FloatingToolbar = ({ targetRef }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef(null);

  // Track active format states
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false,
  });

  const execCmd = useCallback((cmd, value = null) => {
    document.execCommand(cmd, false, value);
    // Re-evaluate active states
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  }, []);

  const insertPullQuote = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString();
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'pull-quote-block';
    blockquote.textContent = `"${text}"`;
    blockquote.contentEditable = 'false';
    range.insertNode(blockquote);
    sel.removeAllRanges();
  }, []);

  const insertHeading = useCallback(() => {
    execCmd('formatBlock', 'h2');
  }, [execCmd]);

  const insertHighlight = useCallback(() => {
    execCmd('hiliteColor', 'hsl(40 70% 88%)');
  }, [execCmd]);

  // Show / position toolbar on selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
        setVisible(false);
        return;
      }

      // Only show when selection is inside one of our contenteditable areas
      const anchorEl = sel.anchorNode?.parentElement;
      const container = targetRef?.current;
      if (!container || !container.contains(anchorEl)) {
        setVisible(false);
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const toolbar = toolbarRef.current;
      const tbWidth = toolbar ? toolbar.offsetWidth : 340;
      const tbHeight = toolbar ? toolbar.offsetHeight : 44;

      let left = rect.left + rect.width / 2 - tbWidth / 2 + window.scrollX;
      let top = rect.top - tbHeight - 8 + window.scrollY;

      // Clamp to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tbWidth - 8));
      if (top < 8) top = rect.bottom + 8 + window.scrollY;

      setPos({ top, left });
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      });
      setVisible(true);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [targetRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="flex items-center gap-0.5 bg-white border border-warm-gray/15 shadow-lg rounded-xl px-2 py-1.5"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ToolBtn icon={Bold}      title="Bold"        onClick={() => execCmd('bold')}      active={activeFormats.bold} />
          <ToolBtn icon={Italic}    title="Italic"      onClick={() => execCmd('italic')}    active={activeFormats.italic} />
          <ToolBtn icon={Underline} title="Underline"   onClick={() => execCmd('underline')} active={activeFormats.underline} />

          <Divider />

          <ToolBtn icon={AlignLeft}   title="Align Left"   onClick={() => execCmd('justifyLeft')}   active={false} />
          <ToolBtn icon={AlignCenter} title="Align Centre" onClick={() => execCmd('justifyCenter')} active={false} />
          <ToolBtn icon={AlignRight}  title="Align Right"  onClick={() => execCmd('justifyRight')}  active={false} />

          <Divider />

          <ToolBtn icon={Highlighter} title="Highlight"   onClick={insertHighlight}  active={false} />
          <ToolBtn icon={Quote}       title="Pull Quote"  onClick={insertPullQuote}  active={false} />
          <ToolBtn icon={Heading2}    title="Heading"     onClick={insertHeading}    active={false} />
          <ToolBtn icon={Type}        title="Normal text" onClick={() => execCmd('formatBlock', 'p')} active={false} />

          <Divider />

          <ToolBtn icon={Undo2} title="Undo" onClick={() => execCmd('undo')} active={false} />
          <ToolBtn icon={Redo2} title="Redo" onClick={() => execCmd('redo')} active={false} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingToolbar;
