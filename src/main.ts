import { Platform, TFile } from "obsidian";
import PluginWithSettings from "obsidian-reusables/src/PluginWithSettings";
import { DEFAULT_SETTINGS, MainPluginSettingsTab } from "./settings";

export default class RevelFolded extends PluginWithSettings(DEFAULT_SETTINGS) {
	override async onload() {
		await this.initSettings(MainPluginSettingsTab);
		this.addCommand({
			id: "reveal-active-file-folded",
			name: "Reveal active file in folded file explorer",
			icon: "folder-search",
			checkCallback: (checking) => {
				const activeFile = this.app.workspace.getActiveFile();

				if (!checking && activeFile) this.doCommand(activeFile);

				return !!activeFile;
			},
		});

		if (Platform.isDesktop)
			this.app.workspace.on("file-open", (file) => {
				const hasActiveFile = this.app.workspace.getActiveFile();

				if (hasActiveFile && file && this.settings.autoReveal)
					this.doCommand(file);
			});
	}

	private doCommand(file: TFile) {
		for (const leave of this.app.workspace.getLeavesOfType(
			"file-explorer",
		)) {
			if (!("tree" in leave.view)) continue;
			leave.view.tree.setCollapseAll(true);
		}
		setTimeout(() => {
			for (const leave of this.app.workspace.getLeavesOfType(
				"file-explorer",
			)) {
				if (!("tree" in leave.view)) continue;
				leave.view.tree.isAllCollapsed = false;
			}
		}, 0);
		setTimeout(() => {
			this.app.commands.executeCommandById(
				"file-explorer:reveal-active-file",
			);
			setTimeout(() => {
				void this.app.workspace.getLeaf().openFile(file);
			}, 50);
		}, 100);
	}
}
