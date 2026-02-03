import { requestUrl, RequestUrlResponse } from "obsidian"

import { ReadeckArticle } from "dtos/ReadeckArticle"
import { ReadeckArticleFlyweight } from "dtos/ReadeckArticlesFlyweight"
import { fromRequestUrlResponse, JSONValue, ReadeckBackendResponse } from "dtos/ReadeckBackendResponse"
import { convertBackendResponseIntoHighlightObject, ReadeckHighlight } from "dtos/ReadeckHighlight"

const HIGHLIGHT_PER_PAGE = 20

export class ReadeckBackend {
    baseUrl: string
    defaultHeaders: Record<string, string>
    articlesFlyweight: ReadeckArticleFlyweight

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl
        this.defaultHeaders = {
            "Accept": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        }
        this.articlesFlyweight = new ReadeckArticleFlyweight()
    }

    updateBaseUrl(baseUrl: string): void {
        this.baseUrl = baseUrl
    }

    updateApiKey(apiKey: string): void {
        this.defaultHeaders["Authorization"] = `Bearer ${apiKey}`
    }

    async makeRequest(path: string, options: RequestInit = {}): Promise<ReadeckBackendResponse> {
        try {
            const url = `${this.baseUrl}${path}`
            const headers = mergeHeaders(
                this.defaultHeaders,
                options.headers,
            )
            const method = (options.method ?? "GET")
            const body = getFormattedBody(options)

            const result = await requestUrl({
                url,
                method,
                headers,
                body,
                throw: false,
            })

            return processResponse(result)
        } catch (error) {
            console.error("Request error:", error)
            throw new Error(`Request failed: ${(error as Error).message}`)
        }
    }

    async fetchTagsForArticle(id: string): Promise<string[]> {
        const url = `/api/bookmarks/${id}`
        const response = await this.makeRequest(url)

        const labels = response.json["labels" as keyof JSONValue] as string[]

        return labels
    }

    async fetchHighlights(lastSyncTs: number): Promise<ReadeckArticle[]> {
        const responses = await requestHighlightFromBackend(async (url) => await this.makeRequest(url))
        const validHighlights = responses
            .map((response) => response.json)
            .flat()
            .filter((highlight) => Date.parse(highlight["created" as keyof JSONValue]) > lastSyncTs)
            .map((highlight) => convertBackendResponseIntoHighlightObject(highlight, this.articlesFlyweight))

        const data: Record<string, ReadeckArticle> =
            await validHighlights
                .reduce(
                    async (accPromise, highlight) => {
                        const acc = await accPromise
                        const { bookmarkId, text, created } = highlight

                        if (!Object.keys(acc).contains(bookmarkId)) {
                            const currentArticle = this.articlesFlyweight.get(bookmarkId)

                            if (currentArticle === undefined) {
                                throw new Error(`Bookmark with id: ${bookmarkId} was not found in flyweight`)
                            }

                            acc[bookmarkId] = currentArticle
                            acc[bookmarkId].tags = await this.fetchTagsForArticle(bookmarkId)
                        }

                        acc[bookmarkId].highlights.push({ text, created } as ReadeckHighlight)

                        return acc
                    },
                    Promise.resolve({} as Record<string, ReadeckArticle>),
                )

        return Object.values(data)
    }
}

function getFormattedBody(options: RequestInit): string | undefined {
    if(options.body !== undefined && options.body !== null) {
        return undefined
    }
    
    if (typeof options.body === "string") { 
        return options.body
    } 
    
    return JSON.stringify(options.body)
}

function mergeHeaders(defaultHeaders: Record<string, string>, requestHeaders: HeadersInit | undefined): Record<string, string> {
    const mergedHeaders = Object.assign({}, defaultHeaders)

    if (requestHeaders !== undefined) {
        const optHeaders = requestHeaders as Record<string, string>
        Object.assign(mergedHeaders, optHeaders)
    }

    return mergedHeaders
}

function processResponse(result: RequestUrlResponse): ReadeckBackendResponse {
    const processedResponse: ReadeckBackendResponse = fromRequestUrlResponse(result)

    if (!processedResponse.ok) {
        console.error("Request failed with status:", processedResponse.status)
        console.error("Response body:", processedResponse.text)

        throw new Error(`HTTP ${processedResponse.status}: ${processedResponse.text}`)
    }

    return processedResponse
}

async function requestHighlightFromBackend(requestFn: (url: string) => Promise<ReadeckBackendResponse>): Promise<ReadeckBackendResponse[]> {
    const url = `/api/bookmarks/annotations?limit=${HIGHLIGHT_PER_PAGE}`
    const response = await requestFn(url)

    const availablePages = Number.parseInt((response.headers.get("Total-Pages") ?? "1"), 10)
    const currentPage = Number.parseInt((response.headers.get("Current-Page") ?? "1"), 10)
    const requests = []

    for (let offset = currentPage; offset < availablePages; offset++) {
        requests.push(
            requestFn(`${url}&offset=${HIGHLIGHT_PER_PAGE * offset}`),
        )
    }

    return [response, ...(await Promise.all(requests))]
}