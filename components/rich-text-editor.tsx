"use client"

import type React from "react"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Quote,
  Pilcrow,
} from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [htmlContent, setHtmlContent] = useState(content)
  const [activeTab, setActiveTab] = useState<string>("rich")

  // Initialize editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setHtmlContent(html)
      onChange(html)
    },
  })

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML() && activeTab === "rich") {
      editor.commands.setContent(content)
    }
  }, [content, editor, activeTab])

  // Handle raw HTML changes
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value
    setHtmlContent(newHtml)
    onChange(newHtml)
  }

  // Update editor content when switching from raw to rich
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "rich" && editor) {
      editor.commands.setContent(htmlContent)
    }
  }

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <Tabs defaultValue="rich" onValueChange={handleTabChange}>
        <div className="flex justify-between items-center border-b border-slate-200 p-1 bg-slate-50">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="rich" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
              Rich Editor
            </TabsTrigger>
            <TabsTrigger value="html" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
              HTML
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rich" className="p-0">
          {editor && <MenuBar editor={editor} />}
          <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none" />
        </TabsContent>

        <TabsContent value="html" className="p-0">
          <textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            className="w-full h-[250px] p-4 font-mono text-sm focus:outline-none resize-none"
            placeholder="Enter HTML content here..."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MenuBarProps {
  editor: Editor
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b border-slate-200 bg-slate-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-slate-200 text-indigo-600" : "text-slate-600 hover:text-indigo-600"}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-slate-200 text-indigo-600" : "text-slate-600 hover:text-indigo-600"}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          editor.isActive("heading", { level: 1 })
            ? "bg-slate-200 text-indigo-600"
            : "text-slate-600 hover:text-indigo-600"
        }
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive("heading", { level: 2 })
            ? "bg-slate-200 text-indigo-600"
            : "text-slate-600 hover:text-indigo-600"
        }
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={
          editor.isActive("heading", { level: 3 })
            ? "bg-slate-200 text-indigo-600"
            : "text-slate-600 hover:text-indigo-600"
        }
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList") ? "bg-slate-200 text-indigo-600" : "text-slate-600 hover:text-indigo-600"
        }
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive("orderedList") ? "bg-slate-200 text-indigo-600" : "text-slate-600 hover:text-indigo-600"
        }
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={
          editor.isActive("codeBlock") ? "bg-slate-200 text-indigo-600" : "text-slate-600 hover:text-indigo-600"
        }
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive("blockquote") ? "bg-slate-200 text-indigo-600" : "text-slate-600 hover:text-indigo-600"
        }
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={
          editor.isActive("paragraph") ? "bg-slate-200 text-indigo-600" : "text-slate-600 hover:text-indigo-600"
        }
        title="Paragraph"
      >
        <Pilcrow className="h-4 w-4" />
      </Button>
      <div className="border-l border-slate-200 mx-1"></div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        className="text-slate-600 hover:text-indigo-600 disabled:opacity-50"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        className="text-slate-600 hover:text-indigo-600 disabled:opacity-50"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

