import React, { useState } from 'react'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/image-editor'
import ImageViewer from './ImageViewer'
import * as Helper from '../common/Helper'
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'

import styles from '../styles/image-editor.module.css'

export default function ImageEditor({ title, images, onDelete }) {
    const [currentImage, setCurrentImage] = useState(0)
    const [openImageDialog, setOpenImageDialog] = useState(false)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [image, setImage] = useState()
    const [index, setIndex] = useState(-1)

    const src = (image) => Helper.joinURL(image.temp ? Env.CDN_TEMP_PRODUCTS : Env.CDN_PRODUCTS, image.src)

    return (
        <div className={styles.images}>
            {
                images.map((image, index) => (
                    <div key={index} className={styles.container}>
                        <div key={index} className={styles.image} onClick={() => {
                            setCurrentImage(index)
                            setOpenImageDialog(true)
                        }}>
                            <img alt='' className={styles.image} src={src(image)} />
                        </div>
                        <div className={styles.action}>
                            <span
                                className={styles.button}
                                title={commonStrings.DELETE}
                                onClick={(e) => {
                                    setImage(image)
                                    setIndex(index)
                                    // setOpenDeleteDialog(true)
                                    if (onDelete) onDelete(image, index)
                                }}>
                                <DeleteIcon className={styles.button} />
                            </span>
                        </div>
                    </div>
                ))
            }

            {
                openImageDialog &&
                <ImageViewer
                    src={images.map(src)}
                    currentIndex={currentImage}
                    closeOnClickOutside={true}
                    title={title}
                    onClose={() => {
                        setOpenImageDialog(false)
                        setCurrentImage(0)
                    }}
                />
            }

            <Dialog
                disableEscapeKeyDown
                maxWidth="xs"
                open={openDeleteDialog}
            >
                <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
                <DialogContent>{strings.DELETE_IMAGE}</DialogContent>
                <DialogActions className='dialog-actions'>
                    <Button onClick={() => setOpenDeleteDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
                    <Button onClick={() => {
                        if (onDelete) onDelete(image, index)
                        setOpenDeleteDialog(false)
                    }} variant='contained' color='error'>{commonStrings.DELETE}</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}