import { Notice, Plugin, TFile, Vault } from "obsidian"

import { ensureFolderExists, sanitizeFileName } from "daos/Filesystem"
import { ReadeckBackend } from "daos/ReadeckBackend"
import { ReadeckArticle } from "dtos/ReadeckArticle"
import { getDefaultReadeckSettings, ReadeckSettings, validateApiKey, validateRemoteUrl } from "dtos/ReadeckSettings"
import { ReadeckSettingTab } from "ui/ReadeckSettingTab"

export default class ReadeckHighlightsSyncPlugin extends Plugin {
    settings!: ReadeckSettings
    backend!: ReadeckBackend

    async onload(): Promise<void> {
        const callback = async() : Promise<void> => {
            await this.syncReadeck()
        }

        await this.loadSettings(),
        this.backend = new ReadeckBackend(
            this.settings.readeckUrl,
            this.settings.apiToken,
        )

        this.setupRibbon(callback),
        this.setupCommand(callback),
        this.addSettingTab(new ReadeckSettingTab(this.app, this))
    }

    async loadSettings(): Promise<void> {
        console.log("Loading settings ...")
        this.settings = Object.assign(
            {}, getDefaultReadeckSettings(), await this.loadData(),
        ) as ReadeckSettings
        console.log("Loaded settings ...", this.settings)
    }

    setupRibbon(callback: () => Promise<void>): void {
        this.addRibbonIcon(
            "sync",
            "Fetch Highlights from Readeck",
            callback,
        )
    }

    setupCommand(callback: () => Promise<void>): void {
        this.addCommand({
            id: "sync-readeck",
            name: "Fetch Highlights from Readeck",
            callback,
        })
    }

    async saveSettings(): Promise<void> {
        console.log("Saving settings ...")
        await this.saveData(this.settings)
        console.log("Saved settings ...", this.settings)
    }

    async syncReadeck(): Promise<void> {
        new Notice("Fetching Highlight from Readeck...")

        try {
            validateApiKey(this.settings)
            validateRemoteUrl(this.settings)

            await ensureFolderExists(this.settings.syncFolder, this.app.vault)

            const articles = await this.backend.fetchHighlights(this.settings.lastSyncTime)

            if (articles.length === 0) {
                new Notice("No new or updated highlights")
                return
            }

            const processedArticles = []

            for (const article of articles) {
                processedArticles.push(createOrUpdateArticleFile(article, this.settings.syncFolder, this.app.vault))
            }

            const highlightsCount = (await Promise.all(processedArticles)).reduce((a, b) => a + b)

            this.settings.lastSyncTime = Date.now()
            await this.saveSettings()

            new Notice(`Fetched ${highlightsCount} new highlights`)
        } catch (error) {
            console.error("Readeck sync error:", error)
            new Notice(`Sync failed: ${(error as Error).message}`)
        }
    }
}

async function createOrUpdateArticleFile(article: ReadeckArticle, readeckFolder: string, vault: Vault): Promise<number> {
    const fileName = sanitizeFileName(article.title)
    const filePath = `${readeckFolder}/${fileName}.md`
    const existingFile = vault.getAbstractFileByPath(filePath)

    if (existingFile instanceof TFile) {
        const existingContent = await vault.read(existingFile)
        const content = buildFileContent(article, existingContent)

        await vault.modify(existingFile, content)
    } else {
        const content = buildFileContent(article)
        await vault.create(filePath, content)
    }

    return article.highlights.length
}

function buildFileContent(article: ReadeckArticle, baseContent = ""): string {
    let content = baseContent

    if (content === "") {
        content += "---\n"
        content += `title: ${article.title}\n`
        content += `url: ${article.url}\n`
        content += "---\n"
        article.tags.forEach((tag, _) => {
            content += `#${sanitizeTag(tag)} `
        })
        content += "\n\n"
    }

    article.highlights
        .sort((a, b) => Date.parse(a["created"]) - Date.parse(b["created"]))
        .forEach((highlight, _) => {
            content += `\`\`\`\n${highlight.text}\n\`\`\`\n\n`
        })

    return content
}

function sanitizeTag(tag: string): string {
    return tag
        .split("")
        .map(char => {
            if (char === " ") {
                return "-"
            }

            if (/[a-zA-Z0-9_\-/]/.test(char)) {
                return char
            }

            return "_"
        })
        .join("")
}