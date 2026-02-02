import { Vault } from "obsidian"

export async function ensureFolderExists(folderPath: string, vault: Vault): Promise<void> {
    const folder = vault.getAbstractFileByPath(folderPath)
    if (folder === null) {
        await vault.createFolder(folderPath)
    }
}

export function sanitizeFileName(name: string): string {
    return name
        .replace(/[\\/:*?"<>|!^]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
}