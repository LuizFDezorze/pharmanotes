import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import Link from '@tiptap/extension-link'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style'
import { useRef, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ResizableImage from './ResizableImage'

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

const SYMBOLS = [
  { group: 'Gregos',     chars: ['α','β','γ','δ','ε','λ','μ','π','σ','φ','Ω'] },
  { group: 'Operadores', chars: ['±','×','÷','≤','≥','≠','≈'] },
  { group: 'Setas',      chars: ['→','←','↑','↓','⇒','⇔'] },
  { group: 'Outros',     chars: ['°','∞','√','∑','∫','½','¼','¾'] },
]

function SymbolPalette({ editor }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onOutsideClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [open])

  function insert(char) {
    editor.chain().focus().insertContent(char).run()
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <ToolbarButton onClick={() => setOpen(o => !o)} active={open} title="Símbolos matemáticos">
        Ω
      </ToolbarButton>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48">
          {SYMBOLS.map(({ group, chars }) => (
            <div key={group} className="mb-2 last:mb-0">
              <p className="text-xs text-gray-400 mb-1">{group}</p>
              <div className="flex flex-wrap gap-0.5">
                {chars.map(char => (
                  <button
                    key={char}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insert(char) }}
                    className="w-7 h-7 flex items-center justify-center text-sm rounded hover:bg-gray-100 transition-colors"
                    title={char}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NoteLinkPicker({ editor }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onOutsideClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [open])

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const timeout = setTimeout(() => {
      supabase
        .from('notes')
        .select('id, title')
        .eq('status', 'published')
        .ilike('title', `%${query.trim()}%`)
        .order('title')
        .limit(8)
        .then(({ data }) => {
          setResults(data ?? [])
          setLoading(false)
        })
    }, 300)
    return () => clearTimeout(timeout)
  }, [open, query])

  function selectNote(note) {
    const href = `/notes/${note.id}`
    const { empty } = editor.state.selection
    if (empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: note.title,
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }
    setOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <div ref={wrapperRef} className="relative">
      <ToolbarButton onClick={() => setOpen(o => !o)} active={open} title="Link para outra nota">
        🔗
      </ToolbarButton>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-64">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Buscar nota pelo título..."
            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <div className="mt-1 max-h-48 overflow-y-auto">
            {loading && (
              <p className="text-xs text-gray-400 px-1 py-1.5">Buscando...</p>
            )}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <p className="text-xs text-gray-400 px-1 py-1.5">Nenhuma nota encontrada.</p>
            )}
            {results.map((note) => (
              <button
                key={note.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); selectNote(note) }}
                className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-gray-100 transition-colors truncate"
                title={note.title}
              >
                {note.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const FONT_FAMILIES = [
  { label: 'Padrão',     value: '' },
  { label: 'Sans-serif', value: 'Arial, sans-serif' },
  { label: 'Serif',      value: 'Georgia, serif' },
  { label: 'Mono',       value: 'Courier New, monospace' },
  { label: 'Sistema',    value: 'system-ui, sans-serif' },
]

const FONT_SIZES = ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','48px']

function FontSelect({ editor }) {
  const current = useEditorState({
    editor,
    selector: ctx => ctx.editor?.getAttributes('textStyle')?.fontFamily ?? '',
  })

  function onChange(e) {
    const val = e.target.value
    if (!val) editor.chain().focus().unsetFontFamily().run()
    else editor.chain().focus().setFontFamily(val).run()
  }

  return (
    <select
      value={current ?? ''}
      onChange={onChange}
      onMouseDown={e => e.stopPropagation()}
      title="Família de fonte"
      className="h-7 text-xs text-gray-700 bg-white border border-gray-200 rounded px-1 cursor-pointer hover:border-gray-400 focus:outline-none"
    >
      {FONT_FAMILIES.map(f => (
        <option key={f.value} value={f.value}>{f.label}</option>
      ))}
    </select>
  )
}

function SizeSelect({ editor }) {
  const current = useEditorState({
    editor,
    selector: ctx => ctx.editor?.getAttributes('textStyle')?.fontSize ?? '',
  })

  function onChange(e) {
    const val = e.target.value
    if (!val) editor.chain().focus().unsetFontSize().run()
    else editor.chain().focus().setFontSize(val).run()
  }

  return (
    <select
      value={current ?? ''}
      onChange={onChange}
      onMouseDown={e => e.stopPropagation()}
      title="Tamanho da fonte"
      className="h-7 text-xs text-gray-700 bg-white border border-gray-200 rounded px-1 cursor-pointer hover:border-gray-400 focus:outline-none w-16"
    >
      <option value="">Tam.</option>
      {FONT_SIZES.map(s => (
        <option key={s} value={s}>{s.replace('px', '')}</option>
      ))}
    </select>
  )
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
      link:         ctx.editor?.isActive('link'),
      alignLeft:    ctx.editor?.isActive({ textAlign: 'left' }),
      alignCenter:  ctx.editor?.isActive({ textAlign: 'center' }),
      alignRight:   ctx.editor?.isActive({ textAlign: 'right' }),
      alignJustify: ctx.editor?.isActive({ textAlign: 'justify' }),
    }),
  })

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 rounded-t-lg">
      <FontSelect editor={editor} />
      <SizeSelect editor={editor} />
      <Divider />
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
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={state?.alignLeft}
        title="Alinhar à esquerda"
      >
        Esq
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={state?.alignCenter}
        title="Centralizar"
      >
        Cen
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={state?.alignRight}
        title="Alinhar à direita"
      >
        Dir
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={state?.alignJustify}
        title="Justificado"
      >
        Jus
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
      <ToolbarButton
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        active={false}
        title="Aumentar recuo (dentro de listas)"
      >
        ⇥
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        active={false}
        title="Diminuir recuo (dentro de listas)"
      >
        ⇤
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

      <Divider />
      <NoteLinkPicker editor={editor} />
      {state?.link && (
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          active={false}
          title="Remover link"
        >
          ✕🔗
        </ToolbarButton>
      )}

      <Divider />
      <SymbolPalette editor={editor} />
    </div>
  )
}

async function uploadImageFile(file) {
  const ext = file.name?.split('.').pop() || 'png'
  const path = `note-images/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('note-images')
    .upload(path, file, { upsert: false })

  if (error) return null

  const { data } = supabase.storage.from('note-images').getPublicUrl(path)
  return data.publicUrl
}

function insertImageAtSelection(view, url) {
  const { schema, tr } = view.state
  const node = schema.nodes.image.create({ src: url })
  view.dispatch(tr.replaceSelectionWith(node))
}

export default function RichTextEditor({ content, onChange }) {
  const fileInputRef = useRef(null)

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: false,
        protocols: ['http', 'https'],
        HTMLAttributes: { rel: 'noopener' },
      }),
      Superscript,
      Subscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: content || '',
    onUpdate({ editor: e }) {
      onChange(e.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[180px] px-4 py-3 focus:outline-none',
      },
      handlePaste(view, event) {
        const item = Array.from(event.clipboardData?.items || []).find((i) =>
          i.type.startsWith('image/')
        )
        if (!item) return false

        const file = item.getAsFile()
        if (!file) return false

        event.preventDefault()
        uploadImageFile(file).then((url) => {
          if (url) insertImageAtSelection(view, url)
          else alert('Erro ao enviar imagem colada.')
        })
        return true
      },
    },
  })

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const url = await uploadImageFile(file)
    if (!url) {
      alert('Erro ao enviar imagem.')
      return
    }

    editor.chain().focus().setImage({ src: url }).run()
    e.target.value = ''
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {editor ? (
        <Toolbar editor={editor} />
      ) : (
        <div className="h-10 bg-gray-50 border-b border-gray-200" />
      )}

      <EditorContent editor={editor} />

      {/* Botão de imagem fora da toolbar para evitar problemas de foco */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-gray-100 bg-gray-50 rounded-b-lg">
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
