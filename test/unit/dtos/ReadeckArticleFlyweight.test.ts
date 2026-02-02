import { ReadeckArticleFlyweight } from "../../../dtos/ReadeckArticlesFlyweight"

describe('ReadeckArticleFlyweight unit tests', () => {
    it('adds a new article to the registry', () => {
        const flyweight = new ReadeckArticleFlyweight()
        flyweight.set('test', 'title', 'http://www.example.com')

        const output = flyweight.get('test')

        expect(output).toBeDefined()
        expect(output?.title).toEqual('title')
        expect(output?.url).toEqual('http://www.example.com')
    })

    it('always return the same instance', () => {
        const flyweight = new ReadeckArticleFlyweight()
        flyweight.set('test', 'title', 'http://www.example.com')

        const output = flyweight.get('test')

        expect(output).toBeDefined()
        expect(output?.title).toEqual('title')
        expect(output?.url).toEqual('http://www.example.com')

        const compare = flyweight.get('test')

        expect(compare).toBe(output)
    })

    it('returns undefined when article is missing', () => {
        const flyweight = new ReadeckArticleFlyweight()
        const output = flyweight.get('test')

        expect(output).toBeUndefined()
    })
})