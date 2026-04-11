// components/decisions/TiptapEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TiptapLink from '@tiptap/extension-link';
import TiptapTaskList from '@tiptap/extension-task-list';
import TiptapTaskItem from '@tiptap/extension-task-item';
import { createLowlight, common } from 'lowlight';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  ListTodo,
} from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';
import { cn } from '@/lib/utils';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (json: string) => void;
  editable?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  editable = true, 
  placeholder = "Start writing...",
  maxLength = 10000 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TiptapTaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-2',
        },
      }),
      TiptapTaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start my-1',
        },
        nested: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none',
          editable ? 'min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent' : ''
        ),
      },
    },
  });

  if (!editable) {
    return (
      <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* Text formatting */}
          <Toggle
            size="sm"
            pressed={editor?.isActive('bold')}
            onPressedChange={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor?.isActive('italic')}
            onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor?.isActive('strike')}
            onPressedChange={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor?.isActive('code')}
            onPressedChange={() => editor?.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Toggle>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Headings */}
          <Toggle
            size="sm"
            pressed={editor?.isActive('heading', { level: 1 })}
            onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor?.isActive('heading', { level: 2 })}
            onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor?.isActive('heading', { level: 3 })}
            onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Lists */}
          <Toggle
            size="sm"
            pressed={editor?.isActive('bulletList')}
            onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor?.isActive('orderedList')}
            onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor?.isActive('taskList')}
            onPressedChange={() => editor?.chain().focus().toggleTaskList().run()}
          >
            <ListTodo className="h-4 w-4" />
          </Toggle>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Blocks */}
          <Toggle
            size="sm"
            pressed={editor?.isActive('codeBlock')}
            onPressedChange={() => editor?.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={editor?.isActive('blockquote')}
            onPressedChange={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Toggle>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Link */}
          <Toggle
            size="sm"
            pressed={editor?.isActive('link')}
            onPressedChange={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor?.chain().focus().setLink({ href: url }).run();
              }
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Toggle>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300" />

          {/* History */}
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Toggle>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Character count */}
      {editable && (
        <div className="border-t border-gray-300 bg-gray-50 px-3 py-2 text-right">
          <span className="text-sm text-gray-600">
            {editor?.storage.characterCount() || 0} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
