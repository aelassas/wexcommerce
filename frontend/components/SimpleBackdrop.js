import React from 'react'
import {
    Backdrop,
    CircularProgress
} from '@mui/material'

const SimpleBackdrop = (props) => (
    <div>
        <Backdrop
            open
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            {props.text}
            {props.progress ? <CircularProgress color="inherit" /> : null}
        </Backdrop>
    </div>
)

export default SimpleBackdrop