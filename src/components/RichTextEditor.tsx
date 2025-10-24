'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';
import { useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Quote,
  Code,
  Undo,
  Redo,
  Type,
  Palette
} from 'lucide-react';

// Custom extension for font size
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-700'
        }
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-gray-900 dark:text-gray-100',
        spellcheck: 'true'
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const setFontSize = (size: string) => {
    // @ts-expect-error - setFontSize is added by custom FontSize extension
    editor.chain().focus().setFontSize(size).run();
    setShowFontSize(false);
  };

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF',
    '#F3F3F3', '#FFFFFF', '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF',
    '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

  const MenuButton = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        active ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar - Sticky */}
      <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={18} />
        </MenuButton>

        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Font Size Dropdown */}
        <div className="relative">
          <MenuButton
            onClick={() => setShowFontSize(!showFontSize)}
            title="Font Size"
          >
            <Type size={18} />
          </MenuButton>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 z-20 min-w-[120px]">
              {fontSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="relative">
          <MenuButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
          >
            <Palette size={18} />
          </MenuButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 z-20">
              <div className="grid grid-cols-10 gap-1 w-[220px]">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColor(color)}
                    className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading"
        >
          <Heading2 size={18} />
        </MenuButton>

        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        <MenuButton
          onClick={(e: any) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={18} />
        </MenuButton>

        <MenuButton
          onClick={(e: any) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </MenuButton>

        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        <MenuButton
          onClick={addLink}
          active={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code size={18} />
        </MenuButton>

        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={18} />
        </MenuButton>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-slate-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
