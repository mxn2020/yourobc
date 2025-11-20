// src/features/boilerplate/blog/components/MarkdownEditor.tsx
/**
 * Markdown Editor Component
 *
 * Rich markdown editor with live preview, toolbar, and keyboard shortcuts
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { twMerge } from 'tailwind-merge';
import {
  Bold,
  Italic,
  Link2,
  Code,
  List,
  ListOrdered,
  Quote,
  Image,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  CheckSquare,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Tabs } from '../../../../components/ui/Tabs';
import { useTranslation } from '@/features/boilerplate/i18n';
import type { MarkdownEditorProps, EditorToolbarAction } from '../types';

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = 500,
  showPreview: initialShowPreview = true,
  autoFocus = false,
  readOnly = false,
}: MarkdownEditorProps) {
  const { t } = useTranslation('blog');
  const [showPreview, setShowPreview] = useState(initialShowPreview);
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Insert text at cursor position
  const insertText = useCallback(
    (before: string, after: string = '', placeholder: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const textToInsert = selectedText || placeholder;

      const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        const newPosition = start + before.length + textToInsert.length;
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    },
    [value, onChange]
  );

  // Insert line prefix (for headings, lists, etc.)
  const insertLinePrefix = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', start);
      const line = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);

      // Check if line already has this prefix
      if (line.startsWith(prefix)) {
        // Remove prefix
        const newText = value.substring(0, lineStart) + line.substring(prefix.length) + value.substring(lineEnd === -1 ? value.length : lineEnd);
        onChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start - prefix.length, start - prefix.length);
        }, 0);
      } else {
        // Add prefix
        const newText = value.substring(0, lineStart) + prefix + line + value.substring(lineEnd === -1 ? value.length : lineEnd);
        onChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + prefix.length, start + prefix.length);
        }, 0);
      }
    },
    [value, onChange]
  );

  // Toolbar actions
  const toolbarActions: EditorToolbarAction[] = [
    {
      id: 'heading1',
      label: t('markdownEditor.toolbar.heading1'),
      icon: 'H1',
      action: () => insertLinePrefix('# '),
      shortcut: 'Ctrl+Alt+1',
    },
    {
      id: 'heading2',
      label: t('markdownEditor.toolbar.heading2'),
      icon: 'H2',
      action: () => insertLinePrefix('## '),
      shortcut: 'Ctrl+Alt+2',
    },
    {
      id: 'heading3',
      label: t('markdownEditor.toolbar.heading3'),
      icon: 'H3',
      action: () => insertLinePrefix('### '),
      shortcut: 'Ctrl+Alt+3',
    },
    {
      id: 'bold',
      label: t('markdownEditor.toolbar.bold'),
      icon: 'Bold',
      action: () => insertText('**', '**', 'bold text'),
      shortcut: 'Ctrl+B',
    },
    {
      id: 'italic',
      label: t('markdownEditor.toolbar.italic'),
      icon: 'Italic',
      action: () => insertText('*', '*', 'italic text'),
      shortcut: 'Ctrl+I',
    },
    {
      id: 'code',
      label: t('markdownEditor.toolbar.code'),
      icon: 'Code',
      action: () => insertText('`', '`', 'code'),
      shortcut: 'Ctrl+E',
    },
    {
      id: 'link',
      label: t('markdownEditor.toolbar.link'),
      icon: 'Link',
      action: () => insertText('[', '](url)', 'link text'),
      shortcut: 'Ctrl+K',
    },
    {
      id: 'image',
      label: t('markdownEditor.toolbar.image'),
      icon: 'Image',
      action: () => insertText('![', '](url)', 'alt text'),
      shortcut: 'Ctrl+Shift+I',
    },
    {
      id: 'unordered-list',
      label: t('markdownEditor.toolbar.bulletList'),
      icon: 'List',
      action: () => insertLinePrefix('- '),
      shortcut: 'Ctrl+Shift+8',
    },
    {
      id: 'ordered-list',
      label: t('markdownEditor.toolbar.numberedList'),
      icon: 'ListOrdered',
      action: () => insertLinePrefix('1. '),
      shortcut: 'Ctrl+Shift+7',
    },
    {
      id: 'task-list',
      label: t('markdownEditor.toolbar.taskList'),
      icon: 'CheckSquare',
      action: () => insertLinePrefix('- [ ] '),
    },
    {
      id: 'quote',
      label: t('markdownEditor.toolbar.quote'),
      icon: 'Quote',
      action: () => insertLinePrefix('> '),
      shortcut: 'Ctrl+Shift+.',
    },
    {
      id: 'divider',
      label: t('markdownEditor.toolbar.horizontalRule'),
      icon: 'Minus',
      action: () => insertText('\n\n---\n\n'),
    },
  ];

  // Icon mapping
  const iconMap: Record<string, React.ElementType> = {
    H1: Heading1,
    H2: Heading2,
    H3: Heading3,
    Bold,
    Italic,
    Code,
    Link: Link2,
    Image,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Minus,
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly) return;

      const action = toolbarActions.find((a) => {
        if (!a.shortcut) return false;
        const parts = a.shortcut.split('+');
        return (
          parts.includes('Ctrl') === (e.ctrlKey || e.metaKey) &&
          parts.includes('Shift') === e.shiftKey &&
          parts.includes('Alt') === e.altKey &&
          e.key === parts[parts.length - 1]
        );
      });

      if (action) {
        e.preventDefault();
        action.action(null);
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown as any);
      return () => textarea.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [toolbarActions, readOnly]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-gray-300 bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-1 flex-wrap">
            {toolbarActions.map((action, index) => {
              const Icon = iconMap[action.icon];
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => action.action(null)}
                  title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                  disabled={readOnly}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}

            {/* View mode toggle */}
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={twMerge(
                  'px-3 py-1.5 text-sm rounded transition-colors',
                  activeTab === 'write'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {t('markdownEditor.viewModes.write')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={twMerge(
                  'px-3 py-1.5 text-sm rounded transition-colors',
                  activeTab === 'split'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {t('markdownEditor.viewModes.split')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={twMerge(
                  'px-3 py-1.5 text-sm rounded transition-colors',
                  activeTab === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {t('markdownEditor.viewModes.preview')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor area */}
      <div className="flex" style={{ height }}>
        {/* Write mode */}
        {(activeTab === 'write' || activeTab === 'split') && (
          <div className={twMerge('flex-1 relative', activeTab === 'split' && 'border-r border-gray-300')}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || t('markdownEditor.placeholder')}
              readOnly={readOnly}
              className="w-full h-full p-4 resize-none focus:outline-none focus:ring-0 border-0 font-mono text-sm"
              style={{ minHeight: height }}
            />
          </div>
        )}

        {/* Preview mode */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || `*${t('markdownEditor.previewPlaceholder')}*`}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="border-t border-gray-300 bg-gray-50 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
        <div>
          {value.split(/\s+/).filter((w) => w.length > 0).length} {t('markdownEditor.footer.words')} •{' '}
          {value.length} {t('markdownEditor.footer.characters')}
        </div>
        <div className="text-gray-400">
          {readOnly ? t('markdownEditor.footer.readOnly') : t('markdownEditor.footer.markdownSupported')}
        </div>
      </div>
    </div>
  );
}

export default MarkdownEditor;
