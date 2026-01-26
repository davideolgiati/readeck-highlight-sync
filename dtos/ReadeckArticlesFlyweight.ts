import { newArticle, ReadeckArticle } from "./ReadeckArticle"

export class ReadeckArticleFlyweight {
    registry: Record<string, ReadeckArticle>

    constructor() {
        this.registry = {}
    }

    get(id: string): ReadeckArticle | undefined {
        return this.registry[id]
    }

    set(id: string, title: string, url: string): void {
        this.registry[id] = newArticle(title, url)
    }
}