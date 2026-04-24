"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-text-style";

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function RichEditor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const btn = (active: boolean) =>
    "rte-btn" + (active ? " rte-btn-active" : "");

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">B</button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></button>
        <button type="button" className={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><u>U</u></button>
        <div className="rte-sep" />
        <button type="button" className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</button>
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</button>
        <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</button>
        <div className="rte-sep" />
        <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">&bull;</button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">1.</button>
        <div className="rte-sep" />
        <button type="button" className={btn(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">&#8676;</button>
        <button type="button" className={btn(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">&#8596;</button>
        <div className="rte-sep" />
        <button type="button" className={btn(editor.isActive("link"))} onClick={() => { const url = prompt("Link URL:"); if (url) { editor.chain().focus().setLink({ href: url }).run(); } else { editor.chain().focus().unsetLink().run(); } }} title="Link">&#128279;</button>
        <button type="button" className="rte-btn" onClick={() => { const url = prompt("Image URL:"); if (url) { editor.chain().focus().setImage({ src: url }).run(); } }} title="Image">&#128247;</button>
        <div className="rte-sep" />
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">&#8213;</button>
        <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">&ldquo;</button>
      </div>
      <EditorContent editor={editor} className="rte-content" />
    </div>
  );
}
