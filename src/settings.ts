import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";
import { FolderSuggest } from "../obsidian-reusables/src/FolderSuggest";

export const DEFAULT_SETTINGS = {
	autoReveal: false,
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
	}
}
