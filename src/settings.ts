import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";
import { FolderSuggest } from "../obsidian-reusables/src/FolderSuggest";

export const DEFAULT_SETTINGS = {
	autoReveal: false,
	excludePattern: "", // Regex pattern to exclude files/folders
	excludeTags: "", // Tags to exclude (comma-separated)
	useIncludeMode: false, // If true, uses inclusion logic instead of exclusion
	collapseOnly: false, // If true, only collapses without revealing
};

export class MainPluginSettingsTab extends PluginSettingTab {
	constructor(
		app: App,
		override plugin: Main,
	) {
		super(app, plugin);
		this.plugin = plugin;
	}

	suggest?: FolderSuggest;

	display() {
		const { containerEl } = this;
		containerEl.empty();
		const options = Object.fromEntries(
			this.app.vault.getAllFolders().map((v) => [v.path, v.path]),
		);
		options["/"] = "/";

		const setAutoReveal = async (v: boolean) => {
			this.plugin.settings.autoReveal = v;
			await this.plugin.saveSettings();
		};

		const setExcludePattern = async (v: string) => {
			this.plugin.settings.excludePattern = v;
			await this.plugin.saveSettings();
		};

		const setExcludeTags = async (v: string) => {
			this.plugin.settings.excludeTags = v;
			await this.plugin.saveSettings();
		};

		const setUseIncludeMode = async (v: boolean) => {
			this.plugin.settings.useIncludeMode = v;
			await this.plugin.saveSettings();
			this.display(); // Refresh to change labels
		};

		const setCollapseOnly = async (v: boolean) => {
			this.plugin.settings.collapseOnly = v;
			await this.plugin.saveSettings();
		};

		// Main Auto reveal setting
		new Setting(containerEl)
			.setName("Auto reveal")
			.setDesc(
				"Automatically reveal your current file (is disabled on mobile)",
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoReveal)
					.onChange(setAutoReveal);
			});

		// Include/exclude mode
		const modeText = this.plugin.settings.useIncludeMode
			? "Include"
			: "Exclude";
		const modeDesc = this.plugin.settings.useIncludeMode
			? "Include mode: auto-reveal will ONLY trigger for files matching the patterns/tags below"
			: "Exclude mode: auto-reveal will NOT trigger for files matching the patterns/tags below";

		new Setting(containerEl)
			.setName("Use include mode instead of exclude mode")
			.setDesc(modeDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.useIncludeMode)
					.onChange(setUseIncludeMode);
			});

		// Regex pattern
		new Setting(containerEl)
			.setName(`${modeText} pattern (regex)`)
			.setDesc(
				`Files/folders matching this regex pattern. Leave empty to disable. Example: '^\\.' to ${modeText.toLowerCase()} hidden files, or '(temp|draft)' for files containing 'temp' or 'draft'`,
			)
			.addText((text) => {
				text.setPlaceholder("^\\.|temp|draft")
					.setValue(this.plugin.settings.excludePattern)
					.onChange(setExcludePattern);
			});

		// Tags
		new Setting(containerEl)
			.setName(`${modeText} tags`)
			.setDesc(
				`Comma-separated list of tags. Files containing these tags will be ${modeText.toLowerCase()}d. Example: private, draft, wip`,
			)
			.addText((text) => {
				text.setPlaceholder("private, draft, wip")
					.setValue(this.plugin.settings.excludeTags)
					.onChange(setExcludeTags);
			});

		// Collapse only option
		new Setting(containerEl)
			.setName("Collapse only mode")
			.setDesc(
				"When enabled, files that don't match the criteria will only collapse the file explorer without revealing the current file",
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.collapseOnly)
					.onChange(setCollapseOnly);
			});

		// Explanatory text
		const explanationEl = containerEl.createEl("div", {
			cls: "setting-item-description",
		});
		explanationEl.innerHTML = `
                        <p><strong>Note:</strong> When a file doesn't match your criteria above, you can always manually reveal it using the command <em>"Reveal Folded: Reveal active file in folded file explorer"</em> from the command palette (Ctrl/Cmd+P).</p>
                `;
		explanationEl.style.marginTop = "20px";
		explanationEl.style.padding = "10px";
		explanationEl.style.backgroundColor = "var(--background-secondary)";
		explanationEl.style.borderRadius = "6px";
	}
}
