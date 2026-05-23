'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import CharacterCount from '@tiptap/extension-character-count'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight,
  ImageIcon, Link as LinkIcon, Youtube as YoutubeIcon,
  TableIcon, Highlighter, Undo, Redo, Minus,
} from 'lucide-react'

// Re-export icon with correct name to avoid collision
const ImageIconComp = ImageIcon
const TableIconComp = TableIcon
const YoutubeIconComp = YoutubeIcon

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

function ToolbarButton({
  onClick, active = false, title, children, disabled = false,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all duration-150 ${
        active
          ? 'bg-purple-600/30 text-purple-300'
          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-white/10 mx-1" />
}

export function TipTapEditor({ content, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error } = await supabase.storage
        .from('articles')
        .upload(filePath, file)

      if (error) {
        console.error('Upload error:', error)
        alert("Erreur lors du telechargement de l'image.")
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('articles')
        .getPublicUrl(data.path)

      if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Youtube.configure({ width: 640, height: 360 }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Commencez Ã  Ã©crire votre article...' }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'tiptap-editor outline-none' },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  const addImage = () => {
    fileInputRef.current?.click()
  }

  const addLink = () => {
    const url = prompt('URL du lien :')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addYoutube = () => {
    const url = prompt('URL YouTube :')
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const wordCount = editor.storage.characterCount?.words?.() ?? 0
  const charCount = editor.storage.characterCount?.characters?.() ?? 0

  return (
    <div className="tiptap-editor border border-white/10 rounded-xl overflow-hidden bg-black/20">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
      />
      {/* â”€â”€ Toolbar â”€â”€ */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/10 bg-white/[0.02]">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler" disabled={!editor.can().undo()}>
          <Undo className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="RÃ©tablir" disabled={!editor.can().redo()}>
          <Redo className="w-3.5 h-3.5" />
        </ToolbarButton>
        <Sep />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Titre 1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Titre 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Titre 3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <Sep />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="SoulignÃ©">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="BarrÃ©">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="SurlignÃ©">
          <Highlighter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <Sep />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Gauche">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centre">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Droite">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarButton>
        <Sep />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste">
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numÃ©rotÃ©e">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citation">
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code inline">
          <Code className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="SÃ©parateur">
          <Minus className="w-3.5 h-3.5" />
        </ToolbarButton>
        <Sep />

        <ToolbarButton onClick={addImage} title="Image" disabled={isUploading}>
          {isUploading ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
          ) : (
            <ImageIconComp className="w-3.5 h-3.5" />
          )}
        </ToolbarButton>
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Lien">
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} title="YouTube">
          <YoutubeIconComp className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={addTable} title="Tableau">
          <TableIconComp className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      {/* â”€â”€ Editor area â”€â”€ */}
      <EditorContent editor={editor} className="min-h-[400px]" />

      {/* â”€â”€ Footer â”€â”€ */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-white/5 text-[11px] text-white/25">
        <span>{wordCount} mots</span>
        <span>{charCount} caractÃ¨res</span>
      </div>
    </div>
  )
}
