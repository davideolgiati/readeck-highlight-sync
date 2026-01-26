import { App, Notice, PluginSettingTab, Setting } from "obsidian"

import ReadeckHighlightsSyncPlugin from "main"

export class ReadeckSettingTab extends PluginSettingTab {
    plugin: ReadeckHighlightsSyncPlugin

    constructor(app: App, plugin: ReadeckHighlightsSyncPlugin) {
        super(app, plugin)
        this.plugin = plugin
    }

    display(): void {
        const remoteURLChangeCallback = async (value: string): Promise<void> => {
            this.plugin.backend.updateBaseUrl(value.trim())
            this.plugin.settings.readeckUrl = value.trim()
            await this.plugin.saveSettings()
        }

        const apiTokenChangeCallback = async (value: string): Promise<void> => {
            this.plugin.backend.updateApiKey(value.trim())
            this.plugin.settings.apiToken = value.trim()
            await this.plugin.saveSettings()
        }

        const connectionTestFn = async (url: string): Promise<void> => {
            await this.plugin.backend.makeRequest(url)
        }

        const { containerEl } = this
        containerEl.empty()

        containerEl.createEl("h2", { text: "Readeck Sync Settings" })

        addRemoteURLTextBox(containerEl, this.plugin.settings.readeckUrl, remoteURLChangeCallback)
        addApiTokenTextBox(containerEl, this.plugin.settings.apiToken, apiTokenChangeCallback)
        addConnectionTestButton(containerEl, connectionTestFn)

        new Setting(containerEl)
            .setName("Sync Folder")
            .setDesc("Folder where Readeck articles will be saved")
            .addText(text => text
                .setPlaceholder("Readeck")
                .setValue(this.plugin.settings.syncFolder)
                .onChange(async (value) => {
                    this.plugin.settings.syncFolder = value.trim()
                    await this.plugin.saveSettings()
                }))

        new Setting(containerEl)
            .setName("Last Sync")
            .setDesc(this.plugin.settings.lastSyncTime > 0
                ? `Last synced: ${new Date(this.plugin.settings.lastSyncTime).toLocaleString()}`
                : "Never synced")
            .addButton(button => button
                .setButtonText("Reset Sync Status")
                .onClick(async () => {
                    this.plugin.settings.lastSyncTime = 0
                    await this.plugin.saveSettings()
                    this.display() // Refresh settings display
                    new Notice("Sync status reset")
                }))

        // Add instructions
        containerEl.createEl("h3", { text: "How to get your API token:" })
        const instructions = containerEl.createEl("ol")
        instructions.createEl("li", { text: "Open your Readeck instance in a browser" })
        instructions.createEl("li", { text: "Go to Settings → API" })
        instructions.createEl("li", { text: "Create a new API token or copy an existing one" })
        instructions.createEl("li", { text: "Paste the token above and click \"Test\" to verify" })
    }
}

function addRemoteURLTextBox(container: HTMLElement, currentURL: string, callback: (value: string) => Promise<void>): void {
    new Setting(container)
        .setName("Readeck URL")
        .setDesc("URL of your Readeck instance (e.g., http://localhost:8000)")
        .addText(text => text
            .setPlaceholder("http://localhost:8000")
            .setValue(currentURL)
            .onChange(async (value) => await callback(value)))
}

function addApiTokenTextBox(container: HTMLElement, currentToken: string, callback: (value: string) => Promise<void>): void {
    new Setting(container)
        .setName("API Token")
        .setDesc("Your Readeck API token (find it in Readeck settings)")
        .addText(text => {
            text.setPlaceholder("Enter API token")
                .setValue(currentToken)
                .onChange(async (value) => await callback(value))
            text.inputEl.type = "password"
        })
}

function addConnectionTestButton(container: HTMLElement, testFn: (value: string) => Promise<void>): void {
    new Setting(container)
        .setName("Test Connection")
        .setDesc("Test your Readeck connection and API token")
        .addButton(button => button
            .setButtonText("Test")
            .onClick(async () => {
                button.setButtonText("Testing...")
                button.setDisabled(true)

                try {
                    const url = "/api/bookmarks?limit=1"
                    await testFn(url)
                    new Notice("Connection successful!")
                } catch (error) {
                    new Notice(`Connection failed: ${(error as Error).message}`)
                    console.error("Connection test failed:", error)
                } finally {
                    button.setButtonText("Test")
                    button.setDisabled(false)
                }
            }))
}