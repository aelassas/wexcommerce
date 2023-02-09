import React, { useEffect, useState } from "react"
import { strings } from '../lang/footer'
import { Phone, Email } from '@mui/icons-material'
import * as Helper from '../common/Helper'

import styles from '../styles/footer.module.css'

const Footer = ({ language }) => {
    const [load, setLoad] = useState(false)

    useEffect(() => {
        if (language) {
            Helper.setLanguage(strings, language)
            setLoad(true)
        }
    }, [language])

    return (
        load &&
        <div className={styles.footer}>
            <div className={styles.main}>
                <div className={styles.content}>
                    <div className={styles.info}>

                        <span>{strings.ADDRESS_1}</span>
                        <span>{strings.ADDRESS_2}</span>
                        <span>{strings.ADDRESS_3}</span>

                        <div className={styles.phone}>
                            <span><Phone className={styles.icon} /></span>
                            <span>{strings.PHONE}</span>
                        </div>
                        <div>
                            <span><Email className={styles.icon} /></span>
                            <span>{strings.EMAIL}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.copyright}>{strings.COPYRIGHT}</div>
            </div>
        </div>
    )
}

export default Footer