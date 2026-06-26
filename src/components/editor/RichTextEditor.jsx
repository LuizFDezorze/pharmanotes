import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { useRef } from 'react'
import { supabase } from '../../lib/supabase'

// StarterKit v3 já inclui: Bold, Italic, Underline, Heading, BulletList,
// OrderedList, Strike, Code, CodeBlock, Blockquote, HardBreak, HorizontalRule.
// Não re-adicionar essas extensões.

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors select-none ${
        active
          ? 'bg-gray-800 text-white'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="w-px h-5 bg-gray-300 mx-0.5 self-center shrink-0" />
}

function Toolbar({ editor }) {
  // useEditorState garante re-render quando o estado do editor muda (TipTap v3)
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      bold:        ctx.editor?.isActive('bold'),
      italic:      ctx.editor?.isActive('italic'),
      underline:   ctx.editor?.isActive('underline'),
      h1:          ctx.editor?.isActive('heading', { level: 1 }),
      h2:          ctx.editor?.isActive('heading', { level: 2 }),
      h3:          ctx.editor?.isActive('heading', { level: 3 }),
      bulletList:   ctx.editor?.isActive('bulletList'),
      orderedList:  ctx.editor?.isActive('orderedList'),
      table:        ctx.editor?.isActive('table'),
      superscript:  ctx.editor?.isActive('superscript'),
      subscript:    ctx.editor?.isActive('subscript'),
    }),
  })

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={state?.bold}
        title="Negrito (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={state?.italic}
        title="Itálico (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={state?.underline}
        title="Sublinhado (Ctrl+U)"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        active={state?.superscript}
        title="Sobrescrito"
      >
        X<sup>2</sup>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        active={state?.subscript}
        title="Subscrito"
      >
        X<sub>2</sub>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={state?.h1}
        title="Título 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={state?.h2}
        title="Título 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={state?.h3}
        title="Título 3"
      >
        H3
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={state?.bulletList}
        title="Lista"
      >
        • Lista
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={state?.orderedList}
        title="Lista numerada"
      >
        1. Lista
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
        active={false}
        title="Inserir tabela"
      >
        Tabela
      </ToolbarButton>
      {state?.table && (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            active={false}
            title="Adicionar coluna"
          >
            +Col
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            active={false}
            title="Adicionar linha"
          >
            +Lin
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            active={false}
            title="Excluir tabela"
          >
            ✕Tab
          </ToolbarButton>
        </>
      )}
    </div>
  )
}

export default function RichTextEditor({ content, onChange }) {
  const fileInputRef = useRef(null)

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false, allowBase64: false }),
      Superscript,
      Subscript,
    ],
    content: content || '',
    onUpdate({ editor: e }) {
      onChange(e.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[180px] px-4 py-3 focus:outline-none',
      },
    },
  })

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const ext = file.name.split('.').pop()
    const path = `note-images/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('note-images')
      .upload(path, file, { upsert: false })

    if (error) {
      alert('Erro ao enviar imagem.')
      return
    }

    const { data } = supabase.storage.from('note-images').getPublicUrl(path)
    editor.chain().focus().setImage({ src: data.publicUrl }).run()
    e.target.value = ''
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {editor ? (
        <Toolbar editor={editor} />
      ) : (
        <div className="h-10 bg-gray-50 border-b border-gray-200" />
      )}

      <EditorContent editor={editor} />

      {/* Botão de imagem fora da toolbar para evitar problemas de foco */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          title="Inserir imagem"
        >
          + Imagem
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  )
}
