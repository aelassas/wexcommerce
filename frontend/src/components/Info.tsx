import React from 'react'
import { strings as commonStrings } from '../lang/common'
import Link from 'next/link'

interface InfoProps {
  message: string
  hideLink?: boolean
  style?: React.CSSProperties
  className?: string
}

const Info: React.FC<InfoProps> = ({ message, hideLink, style, className }) => {

  return (
    <div style={style} className={`${className ? `${className} ` : ''}msg`}>
      <p>{message}</p>
      {!hideLink && <Link href="/">{commonStrings.GO_TO_HOME}</Link>}
    </div>
  )
}

export default Info
