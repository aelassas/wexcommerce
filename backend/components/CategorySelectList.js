import React, { useCallback, useEffect, useState } from 'react'
import * as CategoryService from '../services/CategoryService'
import * as Helper from '../common/Helper'
import MultipleSelect from './MultipleSelect'
import * as SettingService from '../services/SettingService'

export default function CategorySelectList(props) {
    const [loading, setLoading] = useState(false)
    const [keyword, setKeyword] = useState(null)
    const [rows, setRows] = useState([])

    const fetch = useCallback(async () => {
        if (keyword !== null) {
            try {
                setLoading(true)
                const categories = await CategoryService.searchCategories(null, await SettingService.getLanguage(), keyword)
                setRows(categories)
                setLoading(false)
            } catch (err) {
                Helper.error()
            }
        }
    }, [keyword])

    useEffect(() => {
        fetch()
    }, [fetch])

    useEffect(() => {
        setKeyword('')
    }, [])

    const handleChange = (values, key, reference) => {
        if (props.onChange) {
            props.onChange(values)
        }
    }

    return (
        <MultipleSelect
            loading={loading}
            label={props.label || ''}
            callbackFromMultipleSelect={handleChange}
            options={rows}
            selectedOptions={props.selectedOptions || []}
            required={props.required || false}
            multiple={props.multiple}
            readOnly={props.readOnly}
            freeSolo={props.freeSolo}
            hidePopupIcon={props.hidePopupIcon}
            customOpen={props.customOpen}
            variant={props.variant || 'standard'}
            onInputChange={
                (event) => {
                    const value = (event && event.target ? event.target.value : null) || ''

                    if (value !== keyword) {
                        setKeyword(value)
                    }
                }
            }
            onClear={
                (event) => {
                    setKeyword('')
                }
            }
        />
    )
}