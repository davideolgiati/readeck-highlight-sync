export interface ReadeckSettings {
    readeckUrl: string;
    apiToken: string;
    syncFolder: string;
    lastSyncTime: number;
}

export function getDefaultReadeckSettings(): ReadeckSettings {
    return {
        readeckUrl: "http://localhost:8000",
        apiToken: "",
        syncFolder: "Readeck",
        lastSyncTime: 0,
    }
}

export function validateApiKey(settings: ReadeckSettings): void {
    if (settings.apiToken === "") {
        throw new Error("Please configure Readeck API token in settings tab")
    }
}

export function validateRemoteUrl(settings: ReadeckSettings): void {
    if (settings.readeckUrl === "") {
        throw new Error("Please configure Readeck URL in settings tab")
    }
}