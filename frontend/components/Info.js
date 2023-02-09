import React from 'react'
import { strings as commonStrings } from '../lang/common'
import Link from 'next/link'

const Info = ({ message, style, className }) => {

	return (
		<div style={style} className={`${className ? `${className} ` : ''}msg`}>
			<p>{message}</p>
			<Link href='/'>{commonStrings.GO_TO_HOME}</Link>
		</div>
	)
}

export default Info
