import { sanitizeFileName } from "../../../daos/Filesystem"

describe('sanitizeFileName unit tests', () => {
    it('returns the same string', () => {
        const input = "Hello world"
        const output = sanitizeFileName(input)
        
        expect(output).toEqual(input)
    })

    it('removes starting and leading white spaces', () => {
        const input = " Hello World "
        const output = sanitizeFileName(input)

        expect(output).toEqual("Hello World")
    })

    it('removes duplicate adjacent spaces', () => {
        const input = "Hello     World"
        const output = sanitizeFileName(input)

        expect(output).toEqual("Hello World")
    })

    const problematicStrings = [
        { input: "Hello/World",  expected: "Hello_World" },
        { input: "Hello?World",  expected: "Hello_World" },
        { input: "Hello^World",  expected: "Hello_World" },
        { input: "Hello*World",  expected: "Hello_World" },
        { input: "Hello\\World", expected: "Hello_World" },
        { input: "Hello:World",  expected: "Hello_World" },
        { input: "Hello\"World", expected: "Hello_World" },
        { input: "Hello|World",  expected: "Hello_World" },
        { input: "Hello<World",  expected: "Hello_World" },
        { input: "Hello>World",  expected: "Hello_World" },
        { input: "Hello!World",  expected: "Hello_World" }
    ]

    it.each(problematicStrings)('regex correctly sanitize $input', ({input, expected}) => {
        const output = sanitizeFileName(input)

        expect(output).toEqual(expected)
    })
})