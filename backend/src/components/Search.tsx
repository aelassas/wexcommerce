'use client'

import React, { useState } from 'react'
import { strings as commonStrings } from '@/lang/common'
import { IconButton, TextField } from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material'

import styles from '@/styles/search.module.css'

interface SearchProps {
  className?: string
  // eslint-disable-next-line no-unused-vars
  onSubmit?: (value: string) => void
}

const Search: React.FC<SearchProps> = ({ className, onSubmit }) => {
  const [keyword, setKeyword] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSearch = () => {
    if (onSubmit) {
      onSubmit(keyword)
    }
  }

  return (
    <div className={className}>
      <TextField
        variant='standard'
        value={keyword}
        onKeyDown={handleSearchKeyDown}
        onChange={handleSearchChange}
        placeholder={commonStrings.SEARCH_PLACEHOLDER}
        slotProps={{
          input: {
            endAdornment: keyword ? (
              <IconButton size='small' onClick={() => setKeyword('')}>
                <ClearIcon style={{ width: 20, height: 20 }} />
              </IconButton>
            ) : <></>
          }
        }}
        autoComplete='off'
        className={styles.searchInput}
      />
      <IconButton onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
    </div>
  )
}

export default Search
