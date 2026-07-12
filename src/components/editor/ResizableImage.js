import Image from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

// Imagem com largura ajustável (arrasto pela alça) e alinhamento
// esquerda/centro/direita (float, texto flui ao redor quando não centralizada).
// A largura/alinhamento são persistidos como `style` inline no <img>, então o
// mesmo efeito aparece tanto no editor quanto na nota renderizada (NotePage/NoteCard).
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.style.width || null,
        renderHTML: () => ({}),
      },
      align: {
        default: null,
        parseHTML: (el) => {
          if (el.style.float === 'left') return 'left'
          if (el.style.float === 'right') return 'right'
          return null
        },
        renderHTML: () => ({}),
      },
    }
  },

  renderHTML({ HTMLAttributes, node }) {
    const { width, align } = node.attrs
    const style = []
    if (width) style.push(`width: ${width}`)
    if (align === 'left') style.push('float: left', 'margin: 0.25rem 1.25rem 0.75rem 0')
    else if (align === 'right') style.push('float: right', 'margin: 0.25rem 0 0.75rem 1.25rem')
    else style.push('display: block', 'margin: 0.75rem auto')

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { style: style.join('; ') }),
    ]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const wrapper = document.createElement('span')
      wrapper.className = 'tiptap-image-wrapper'
      wrapper.contentEditable = 'false'

      const img = document.createElement('img')
      img.src = node.attrs.src
      if (node.attrs.alt) img.alt = node.attrs.alt
      if (node.attrs.title) img.title = node.attrs.title

      const toolbar = document.createElement('span')
      toolbar.className = 'tiptap-image-toolbar'

      const alignOptions = [
        { align: 'left', label: '⬅', title: 'Alinhar à esquerda (texto ao lado)' },
        { align: null, label: '▬', title: 'Centralizado (bloco)' },
        { align: 'right', label: '➡', title: 'Alinhar à direita (texto ao lado)' },
      ]
      const buttons = alignOptions.map(({ align, label, title }) => {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = label
        btn.title = title
        btn.addEventListener('mousedown', (e) => e.preventDefault())
        btn.addEventListener('click', () => {
          if (typeof getPos !== 'function') return
          editor.chain().focus().setNodeSelection(getPos()).updateAttributes('image', { align }).run()
        })
        return { btn, align }
      })
      buttons.forEach(({ btn }) => toolbar.appendChild(btn))

      const handle = document.createElement('span')
      handle.className = 'tiptap-image-handle'

      wrapper.append(img, toolbar, handle)

      function applyStyles() {
        const { width, align } = node.attrs
        wrapper.style.width = width || ''
        img.style.width = width ? '100%' : ''
        wrapper.classList.toggle('is-float-left', align === 'left')
        wrapper.classList.toggle('is-float-right', align === 'right')
        wrapper.classList.toggle('is-center', !align)
        buttons.forEach(({ btn, align: btnAlign }) => {
          btn.classList.toggle('active', (align || null) === btnAlign)
        })
      }
      applyStyles()

      handle.addEventListener('mousedown', (event) => {
        event.preventDefault()
        event.stopPropagation()
        const startX = event.clientX
        const startWidth = img.getBoundingClientRect().width
        const parentWidth = wrapper.parentElement?.getBoundingClientRect().width || startWidth
        wrapper.classList.add('is-resizing')

        function onMove(ev) {
          const delta = ev.clientX - startX
          const newWidth = Math.min(parentWidth, Math.max(60, startWidth + delta))
          wrapper.style.width = `${Math.round(newWidth)}px`
          img.style.width = '100%'
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)
          wrapper.classList.remove('is-resizing')
          if (typeof getPos === 'function') {
            editor.chain().setNodeSelection(getPos()).updateAttributes('image', { width: wrapper.style.width }).run()
          }
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
      })

      return {
        dom: wrapper,
        update(updatedNode) {
          if (updatedNode.type.name !== 'image') return false
          node = updatedNode
          img.src = node.attrs.src
          applyStyles()
          return true
        },
        selectNode() {
          wrapper.classList.add('is-selected')
        },
        deselectNode() {
          wrapper.classList.remove('is-selected')
        },
        stopEvent(event) {
          return handle.contains(event.target) || toolbar.contains(event.target)
        },
        ignoreMutation() {
          return true
        },
      }
    }
  },
})

export default ResizableImage
