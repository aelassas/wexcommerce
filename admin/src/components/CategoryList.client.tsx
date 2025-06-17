'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material'
import {
  AccountTree as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/category-list'
import * as helper from '../common/helper'
import * as CategoryService from '../lib/CategoryService'
import EmptyListComponent from '@/components/EmptyList'

import styles from '../styles/category-list.module.css'

export const EmptyList: React.FC = () => (
  <EmptyListComponent text={strings.EMPTY_LIST} marginTop />
)

export const EmptyCategoryIcon: React.FC = () => (
  <CategoryIcon className={styles.categoryIcon} />
)

interface ActionsProps {
  categoryId: string
}

export const Actions: React.FC<ActionsProps> = ({ categoryId }) => {
  const router = useRouter()

  const [openInfoDialog, setOpenInfoDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const handleDelete = async () => {
    try {
      const status = await CategoryService.check(categoryId)

      if (status === 204) {
        setOpenDeleteDialog(true)
      } else if (status === 200) {
        setOpenInfoDialog(true)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const handleCloseInfo = () => {
    setOpenInfoDialog(false)
  }

  const handleConfirmDelete = async () => {
    try {
      if (categoryId !== '') {
        const status = await CategoryService.deleteCategory(categoryId)

        if (status === 200) {
          router.refresh()
        } else {
          helper.error()
        }
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false)
  }

  return (
    <div className={styles.categoryActions}>
      <Tooltip title={commonStrings.UPDATE}>
        <IconButton onClick={() => {
          router.push(`/category?c=${categoryId}`)
        }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={commonStrings.DELETE}>
        <IconButton data-id={categoryId} onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openInfoDialog}
      >
        <DialogTitle className="dialog-header">{commonStrings.INFO}</DialogTitle>
        <DialogContent>{strings.CANNOT_DELETE_CATEGORY}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseInfo} variant="contained" className="btn-secondary">{commonStrings.CLOSE}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openDeleteDialog}
      >
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{strings.DELETE_CATEGORY}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCancelDelete} variant="contained" className="btn-secondary">{commonStrings.CANCEL}</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">{commonStrings.DELETE}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
