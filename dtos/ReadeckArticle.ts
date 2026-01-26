import { ReadeckHighlight } from "./ReadeckHighlight"

export interface ReadeckArticle {
    title: string;
    url: string;
    tags: string[]
    highlights: ReadeckHighlight[]
}

export function newArticle(title: string, url: string, tags: string[] = [], highlights: ReadeckHighlight[] = []): ReadeckArticle {
    return {
        title,
        url,
        tags,
        highlights,
    } as ReadeckArticle
}