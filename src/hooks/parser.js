/**
 * @date 2025-05-10
 * @description This hook provides methods to parse and validate data loaded from JSON files.
 */

import {useViewport} from "/src/providers/ViewportProvider.jsx"
import {useLanguage} from "/src/providers/LanguageProvider.jsx"
import {useTheme} from "/src/providers/ThemeProvider.jsx"
import ArticleDataWrapper from "/src/hooks/models/ArticleDataWrapper.js"

export const useParser = () => {
    const viewport = useViewport()
    const language = useLanguage()
    const theme = useTheme()

    /**
     * @param {Object} section
     * @return {{title: String, navTitle: String}}
     */
    const parseSectionTitle = (section) => {
        const isLgOrHigher = viewport.isBreakpoint("lg")
        const titleLocales = section.data?.title?.locales || {}

        return {
            title:
                isLgOrHigher ?
                language.getTranslation(titleLocales, "title_long") :
                language.getTranslation(titleLocales, "title_short"),

            // prefix:                                       // @code -- START: title_long_prefix --
            //     isLgOrHigher ?                            // @code
            //     language.getTranslation(titleLocales, "title_long_prefix") :   // @code
            //     null,                                     // @code
            // @code -- END: title_long_prefix --

            navTitle:
                language.getTranslation(titleLocales, "title_short_nav")
        }
    }

    /**
     * @param {Object} section
     * @return {ArticleDataWrapper[]}
     */
    const parseSectionArticles = (section) => {
        const articles = section.data?.articles || []
        return articles.map((article, key) => {
            return new ArticleDataWrapper(section, article, language, theme, key + 1)
        })
    }

    return {
        parseSectionTitle,
        parseSectionArticles
    }
}