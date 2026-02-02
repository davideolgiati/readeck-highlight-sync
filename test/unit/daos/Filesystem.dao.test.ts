const getAbstractFileByPath = jest.fn()
const createFolder = jest.fn()

jest.mock("obsidian", () => ({
    Vault: jest.fn().mockImplementation(() => ({
        getAbstractFileByPath,
        createFolder,
    }))
}), { virtual: true })

import { Vault } from "obsidian"

import { ensureFolderExists, sanitizeFileName } from "../../../daos/Filesystem"

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
        { input: "Hello/World", expected: "Hello_World" },
        { input: "Hello?World", expected: "Hello_World" },
        { input: "Hello^World", expected: "Hello_World" },
        { input: "Hello*World", expected: "Hello_World" },
        { input: "Hello\\World", expected: "Hello_World" },
        { input: "Hello:World", expected: "Hello_World" },
        { input: "Hello\"World", expected: "Hello_World" },
        { input: "Hello|World", expected: "Hello_World" },
        { input: "Hello<World", expected: "Hello_World" },
        { input: "Hello>World", expected: "Hello_World" },
        { input: "Hello!World", expected: "Hello_World" }
    ]

    it.each(problematicStrings)('regex correctly sanitize $input', ({ input, expected }) => {
        const output = sanitizeFileName(input)

        expect(output).toEqual(expected)
    })
})

describe('ensureFolderExists unit tests', () => {
    it('does nothing if folder exists', async () => {
        jest.clearAllMocks()
        getAbstractFileByPath.mockReturnValue("not the actual value but as long as it isn't null it should work")

        const testVault = new Vault()

        await ensureFolderExists("testFolder", testVault)

        expect(testVault.getAbstractFileByPath).toHaveBeenCalledTimes(1)
        expect(testVault.getAbstractFileByPath).toHaveBeenCalledWith("testFolder")
        expect(testVault.createFolder).not.toHaveBeenCalled()
    })

    it('it creates a new folder if given path doesn\'t exist', async () => {
        jest.clearAllMocks()
        getAbstractFileByPath.mockReturnValue(null)

        const testVault = new Vault()

        await ensureFolderExists("testFolder", testVault)

        expect(testVault.getAbstractFileByPath).toHaveBeenCalledTimes(1)
        expect(testVault.getAbstractFileByPath).toHaveBeenCalledWith("testFolder")
        expect(testVault.createFolder).toHaveBeenCalledTimes(1)
        expect(testVault.createFolder).toHaveBeenCalledWith("testFolder")
    })
})