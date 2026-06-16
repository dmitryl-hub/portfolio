import "./Preloader.scss"
import React, {useEffect, useState} from 'react'
import Logo from "/src/components/widgets/Logo.jsx"
import {useScheduler} from "/src/hooks/scheduler.js"
import {useUtils} from "/src/hooks/utils.js"
import {useConstants} from "/src/hooks/constants.js"

const PreloaderState = {
    NONE:               { id: 0, key: "none" },
    PREPARING:          { id: 1, key: "preparing" },
    SHOWING:            { id: 2, key: "showing" },
    SHOWN:              { id: 3, key: "shown" },
    READY_TO_HIDE:      { id: 4, key: "readyToHide" },
    HIDING:             { id: 5, key: "hiding" },
    HIDDEN:             { id: 6, key: "hidden" },
}

function Preloader({ children, preloaderSettings }) {
    const scheduler = useScheduler()
    const utils = useUtils()
    const constants = useConstants()

    const enabled = preloaderSettings?.enabled
    const title = preloaderSettings?.title || ""
    const subtitle = preloaderSettings?.subtitle || ""
    const logoOffset = preloaderSettings?.logoOffset || {}

    const [state, setState] = useState(PreloaderState.NONE)
    const [didLoadAllImages, setDidLoadAllImages] = useState(false)

    const tag = "Preloader"
    const minDisplayTime = 1000
    const shouldShowPreloaderWindow = state.id > PreloaderState.NONE.id && state.id < PreloaderState.HIDDEN.id
    const shouldShowContent = state.id >= PreloaderState.SHOWN.id
    const shouldShowContentElements = state.id >= PreloaderState.SHOWING.id
    const isHiding = state.id >= PreloaderState.HIDING.id

    /** @constructs **/
    useEffect(() => {
        setState(PreloaderState.NONE)

        if(!enabled) {
            setState(PreloaderState.HIDDEN)
            return
        }

        setState(PreloaderState.PREPARING)
    }, [null])

    /**
     * @listens PreloaderState.PREPARING
     */
    useEffect(() => {
        if(state !== PreloaderState.PREPARING || !didLoadAllImages)
            return
        utils.dom.setBodyScrollEnabled(false)
        scheduler.clearAllWithTag(tag)
        setState(PreloaderState.SHOWING)
    }, [state === PreloaderState.PREPARING, didLoadAllImages])

    /**
     * @listens PreloaderState.SHOWING
     */
    useEffect(() => {
        if(state !== PreloaderState.SHOWING)
            return
        scheduler.clearAllWithTag(tag)
        scheduler.schedule(() => {
            setState(PreloaderState.SHOWN)
        }, 1000, tag)
    }, [state === PreloaderState.SHOWING])

    /**
     * @listens PreloaderState.SHOWN
     */
    useEffect(() => {
        if(state !== PreloaderState.SHOWN)
            return
        scheduler.clearAllWithTag(tag)
        scheduler.schedule(() => {
            setState(PreloaderState.READY_TO_HIDE)
        }, minDisplayTime, tag)
    }, [state === PreloaderState.SHOWN])

    /**
     * @listens PreloaderState.READY_TO_HIDE
     */
    useEffect(() => {
        if(state !== PreloaderState.READY_TO_HIDE)
            return
        scheduler.clearAllWithTag(tag)

        if(utils.storage.getWindowVariable("stayOnThePreloaderScreen"))
            return

        let timePassed = 0
        scheduler.interval(() => {
            timePassed += 0.1
            const imageCount = utils.dom.getImageCount(constants.HTML_CLASSES.imageView)
            const imageLoadPercentage = utils.dom.getImageLoadPercentage(constants.HTML_CLASSES.imageView)

            const didLoadAllImages = imageLoadPercentage >= 100 && imageCount > 0 && timePassed >= 0.5
            const noImagesFound = timePassed >= 4 && imageCount === 0
            const didLoadEnoughTime = timePassed >= 5

            if(didLoadAllImages || noImagesFound || didLoadEnoughTime) {
                setState(PreloaderState.HIDING)
            }
        }, 100, tag)
    }, [state === PreloaderState.READY_TO_HIDE])

    /**
     * @listens PreloaderState.HIDING
     */
    useEffect(() => {
        if(state !== PreloaderState.HIDING)
            return

        scheduler.clearAllWithTag(tag)
        utils.dom.setBodyScrollEnabled(true)
        scheduler.schedule(() => {
            setState(PreloaderState.HIDDEN)
        }, 500, tag)
    }, [state === PreloaderState.HIDING])

    /**
     * @listens PreloaderState.HIDDEN
     */
    useEffect(() => {
        if(state !== PreloaderState.HIDDEN)
            return
        scheduler.clearAllWithTag(tag)
        utils.dom.setBodyScrollEnabled(true)
        document.body.classList.add(constants.HTML_CLASSES.bodyAfterLoading)
    }, [state === PreloaderState.HIDDEN])

    return (
        <div className={`preloader-content-wrapper`}>
            {shouldShowPreloaderWindow && (
                <PreloaderWindow title={title}
                                 subtitle={subtitle}
                                 logoOffset={logoOffset}
                                 setDidLoadAllImages={setDidLoadAllImages}
                                 showElements={shouldShowContentElements}
                                 isHiding={isHiding}/>
            )}

            {shouldShowContent && (
                <PreloaderContent children={children}/>
            )}
        </div>
    )
}

function PreloaderWindow({ title, subtitle, logoOffset, setDidLoadAllImages, showElements, isHiding }) {
    const scheduler = useScheduler()

    const [didLoadLogo, setDidLoadLogo] = useState(false)

    const hiddenClass = isHiding ?
        `preloader-window-hidden` : ``

    useEffect(() => {
        if(didLoadLogo)
            setDidLoadAllImages(true)
    }, [didLoadLogo])

    return (
        <div className={`preloader-window ${hiddenClass}`}>
            <div className={`preloader-window-content`}>
                <PreloaderWindowInfo title={title}
                                     subtitle={subtitle}
                                     logoOffset={logoOffset}
                                     hidden={!showElements}
                                     setDidLoadLogo={setDidLoadLogo}/>
            </div>
        </div>
    )
}

function PreloaderWindowInfo({ title, subtitle, logoOffset, hidden, setDidLoadLogo }) {
    const utils = useUtils()
    const scheduler = useScheduler()

    const [isHidden, setIsHidden] = useState(true)
    const [isPulseActive, setIsPulseActive] = useState(false)

    const hiddenClass = isHidden ?
        `preloader-window-info-hidden` : ``

    const pulseClass = isPulseActive ?
        `preloader-window-logo-pulse` : ``

    const [offsetTop, setOffsetTop] = useState(0)
    const [offsetRight, setOffsetRight] = useState(0)

    const logoStyle = {
        marginTop: `${offsetTop}px`,
        marginRight: `${offsetRight}px`,
    }

    useEffect(() => {
        window.addEventListener('resize', _onResize)
        _onResize()
        return () => {
            window.removeEventListener('resize', _onResize)
        }
    }, [])

    useEffect(() => {
        if(hidden) {
            setIsHidden(true)
            setIsPulseActive(false)
            return
        }

        scheduler.clearAllWithTag("preloader-window-info")
        scheduler.clearAllWithTag("preloader-pulse")
        scheduler.schedule(() => {
            setIsHidden(false)
        }, 600, "preloader-window-info")
        scheduler.schedule(() => {
            setIsPulseActive(true)
        }, 800, "preloader-pulse")
    }, [hidden])

    const _onResize = () => {
        if (!logoOffset)
            return

        let scale = 1

        const width = window.innerWidth
        const { BREAKPOINTS } = utils.css

        if (width < BREAKPOINTS.sm) scale = 0.72
        else if (width < BREAKPOINTS.md) scale = 0.84
        else if (width < BREAKPOINTS.lg) scale = 0.90
        else if (width < BREAKPOINTS.xl) scale = 0.95

        setOffsetTop(logoOffset.top * scale)
        setOffsetRight(logoOffset.right * scale)
    }

    return (
        <div className={`preloader-window-info ${hiddenClass}`}>
            <div className={`preloader-window-info-title`}>
                <Logo size={4}
                      className={`preloader-window-logo ${pulseClass}`}
                      setDidLoad={setDidLoadLogo}
                      style={logoStyle}/>

                <div className={`preloader-window-info-text`}>
                    <h5 className={`h1 mb-0`}
                        dangerouslySetInnerHTML={{__html: title}}/>
                    <div className={`h3`}
                         dangerouslySetInnerHTML={{__html: subtitle}}/>
                </div>
            </div>
        </div>
    )
}

function PreloaderContent({ children }) {
    return (
        <div className={`preloader-content`}>
            {children}
        </div>
    )
}

export default Preloader