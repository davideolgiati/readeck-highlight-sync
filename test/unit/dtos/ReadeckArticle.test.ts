import { ReadeckHighlight } from "dtos/ReadeckHighlight"

import { newArticle } from "../../../dtos/ReadeckArticle"

describe("newArticle unit tests", () => {
    it("creates a new article using just url and title", () => {
        const output = newArticle("test", "https://www.example.com")

        expect(output.title).toEqual("test")
        expect(output.url).toEqual("https://www.example.com")
        expect(output.tags).toEqual([])
        expect(output.highlights).toEqual([])
    })

    it("creates a new article using url, title and tags", () => {
        const output = newArticle("test", "https://www.example.com", ["test1", "test2"])

        expect(output.title).toEqual("test")
        expect(output.url).toEqual("https://www.example.com")
        expect(output.tags).toEqual(["test1", "test2"])
        expect(output.highlights).toEqual([])
    })

    it("creates a new article using url, title, tags and highlights", () => {
        const highlight = {
            "bookmarkId": "test1",
            "text": "this is a test :)",
            "created": "2026-02-02T21:00:00.000Z",
        } as ReadeckHighlight
        const output = newArticle("test", "https://www.example.com", ["test1", "test2"], [highlight])

        expect(output.title).toEqual("test")
        expect(output.url).toEqual("https://www.example.com")
        expect(output.tags).toEqual(["test1", "test2"])
        expect(output.highlights).toEqual([highlight])
    })
})