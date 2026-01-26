import { ReadeckArticleFlyweight } from "./ReadeckArticlesFlyweight"
import { JSONValue } from "./ReadeckBackendResponse"

const BOOKMARK_ID_KEY = "bookmark_id" as keyof JSONValue
const HIGHLIGHTED_TEXT_KEY = "text" as keyof JSONValue
const CREATION_TIMESTAMP_KEY = "created" as keyof JSONValue
const BOOKMARK_TITLE_KEY = "bookmark_title" as keyof JSONValue
const BOOKMARK_URL_KEY = "bookmark_url" as keyof JSONValue

export interface ReadeckHighlight {
    bookmarkId: string,
    text: string;
    created: string;
}

export function newHighlight(bookmarkId: string, text: string, created: string): ReadeckHighlight {
    return {
        bookmarkId,
        text,
        created,
    } as ReadeckHighlight
}

export function convertBackendResponseIntoHighlightObject(backendResponse: JSONValue, articlesFlyweight: ReadeckArticleFlyweight): ReadeckHighlight {
    const bookmarkId = backendResponse[BOOKMARK_ID_KEY]
    const highlightedText = backendResponse[HIGHLIGHTED_TEXT_KEY]
    const creationTimestamp = backendResponse[CREATION_TIMESTAMP_KEY]

    if (articlesFlyweight.get(bookmarkId) === undefined) {
        const bookmarkTitle = backendResponse[BOOKMARK_TITLE_KEY]
        const bookmarkURL = backendResponse[BOOKMARK_URL_KEY]

        articlesFlyweight.set(bookmarkId, bookmarkTitle, bookmarkURL)
    }

    return newHighlight(bookmarkId, highlightedText, creationTimestamp)
}