
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/no-match'
import * as Helper from '../common/Helper'

import styles from '../styles/no-match.module.css'

export default function NoMatch({ language }) {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (language) {
            Helper.setLanguage(commonStrings, language)
            Helper.setLanguage(strings, language)
            setLoaded(true)
        }
    }, [language])

    return (
        loaded &&
        <div className={styles.noMatch}>
            <h2>{strings.NO_MATCH}</h2>
            <p><Link href='/'>{commonStrings.GO_TO_HOME}</Link></p>
        </div>
    )
}