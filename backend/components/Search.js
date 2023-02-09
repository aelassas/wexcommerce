import React, { useState } from 'react'
import { strings as commonStrings } from '../lang/common'
import { IconButton, TextField } from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material'

import styles from '../styles/search.module.css'

export default function Search({ className, onSubmit }) {
    const [keyword, setKeyword] = useState('')

    const handleSearchChange = (e) => {
        setKeyword(e.target.value)
    }

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleSearch = (e) => {
        if (onSubmit) onSubmit(keyword)
    }

    return (
        <div className={className}>
            <TextField
                variant='standard'
                value={keyword}
                onKeyDown={handleSearchKeyDown}
                onChange={handleSearchChange}
                placeholder={commonStrings.SEARCH_PLACEHOLDER}
                InputProps={{
                    endAdornment: keyword ? (
                        <IconButton size='small' onClick={() => setKeyword('')}>
                            <ClearIcon style={{ width: 20, height: 20 }} />
                        </IconButton>
                    ) : <></>
                }}
                autoComplete='off'
                className={styles.searchInput}
            />
            <IconButton onClick={handleSearch} >
                <SearchIcon />
            </IconButton>
        </div>
    )
}