import "./AvatarView.scss"
import React, {useEffect, useState} from 'react'
import ImageView from "/src/components/generic/ImageView.jsx"
import {useTheme} from "/src/providers/ThemeProvider.jsx"

function AvatarView({ src = "", alt = "", faIcon = "", className = "",  id = null, style = null }) {
    const theme = useTheme()
    const isDarkTheme = theme?.getSelectedTheme()?.dark
    const resolvedSrc = src && !isDarkTheme ? src.replace(/\.svg$/i, '-dark.svg') : src

    return (
        <div className={`avatar-view ${className}`}
             id={id}
             style={style}>
            {resolvedSrc && (
                <ImageView src={resolvedSrc}
                           alt={alt}
                           className={`avatar-view-image-view`}/>
            )}

            {!resolvedSrc && (
                <div className={`avatar-icon-view`}>
                    <i className={`${faIcon}`}/>
                </div>
            )}
        </div>
    )
}

export default AvatarView