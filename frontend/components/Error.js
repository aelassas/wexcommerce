import React from 'react'
import { strings as commonStrings } from '../lang/common'
import Link from 'next/link'

import styles from '../styles/error.module.css'

const Error = ({ message, style, homeLink }) => {

	return (
		<div style={style}>
			<div className={styles.error}>
				<span className={styles.message}>{message ?? commonStrings.GENERIC_ERROR}</span>
			</div>
			{homeLink && <p><Link href='/'>{commonStrings.GO_TO_HOME}</Link></p>}
		</div>
	)
}

export default Error
