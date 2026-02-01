# Readeck Highlights Sync

An Obsidian plugin that syncs your [Readeck](https://readeck.org) highlights into your vault as Markdown notes.

## How It Works

- Fetches all highlights created since the last sync via the Readeck API.
- Groups highlights by article and saves each article as a `.md` file in a configurable folder.
- Includes YAML details (`title`, `url`) and any associated tags as Obsidian hashtags.
- On subsequent syncs, new highlights are appended to existing files — nothing is overwritten.

## Setup

1. Install the plugin and enable it in Obsidian's community plugins.
2. Open **Settings → Readeck Highlights Sync Settings**.
3. Enter your **Readeck URL** (e.g., `http://localhost:8000`).
4. Generate an API token in your Readeck instance (**Settings → API**) and paste it in.
5. Click **Test** to verify the connection.
6. Optionally change the **Sync Folder** (defaults to `Readeck`).

## Usage

Trigger a sync by either:

- Clicking the **sync icon** in the left ribbon, or
- Running the command **Fetch Highlights from Readeck** from the command palette (`Ctrl+P`).

A notice will confirm how many new highlights were fetched, or let you know if there's nothing new.

## Settings

| Setting | Description | Default |
|---|---|---|
| Readeck URL | Base URL of your Readeck instance | `http://localhost:8000` |
| API Token | Token from Readeck's API settings | — |
| Sync Folder | Vault folder for synced articles | `Readeck` |