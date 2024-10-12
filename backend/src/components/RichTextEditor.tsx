'use client'

import React, { ComponentType, useEffect, useState } from 'react'
import { EditorProps } from 'react-draft-wysiwyg'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import * as wexcommerceHelper from ':wexcommerce-helper'

let htmlToDraft = null
let Editor: ComponentType<EditorProps> | null = null
if (typeof window === 'object') {
  htmlToDraft = require('html-to-draftjs').default
  Editor = require('react-draft-wysiwyg').Editor
}

interface RichTextEditorProps {
  language: string
  value?: string
  className?: string
  onChange?: (value: string) => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = (
  {
    language,
    value: valueFromProps = '',
    className,
    onChange,
  }
) => {
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty())

  useEffect(() => {
    const contentBlock = htmlToDraft(valueFromProps)
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
    const _editorState = EditorState.createWithContent(contentState)
    setEditorState(_editorState)
  }, [valueFromProps])

  const handleEditorStateChange = (state: EditorState) => {
    setEditorState(state)
    const content = draftToHtml(convertToRaw(state.getCurrentContent()))
    const value = wexcommerceHelper.trimCarriageReturn(content).trim() === '<p></p>' ? '' : content
    if (onChange) {
      onChange(value)
    }
  }

  return Editor && (
    <Editor
      editorState={editorState}
      editorClassName={className}
      onEditorStateChange={handleEditorStateChange}
      toolbar={{
        options: ['inline', 'blockType', 'fontSize', 'link', 'embedded', 'list', 'textAlign', 'colorPicker', 'image', 'remove', 'history'],
      }}
      localization={{
        locale: language
      }}
      stripPastedStyles
    />
  )
}

export default RichTextEditor
