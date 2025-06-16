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

				if (!checking && activeFile) this.doCommand(activeFile, false); // false = always reveal

				return !!activeFile;
			},
		});

		if (Platform.isDesktop)
			this.app.workspace.on("file-open", (file) => {
				const hasActiveFile = this.app.workspace.getActiveFile();

				if (hasActiveFile && file && this.settings.autoReveal) {
					this.handleAutoReveal(file);
				}
			});
	}

	/**
	 * Handles auto-reveal with all inclusion/exclusion logic
	 */
	private async handleAutoReveal(file: TFile) {
		const shouldProcess = await this.shouldProcessFile(file);

		if (shouldProcess) {
			// File matches criteria: reveal normally
			this.doCommand(file, false);
		} else if (this.settings.collapseOnly) {
			// File doesn't match but we want to collapse only
			this.doCommand(file, true); // true = collapse only
		}
		// Otherwise, do nothing (neither reveal nor collapse)
	}

	/**
	 * Determines if a file should be processed according to inclusion/exclusion criteria
	 */
	private async shouldProcessFile(file: TFile): Promise<boolean> {
		const matchesPattern = this.testPattern(file);
		const matchesTags = await this.testTags(file);

		// At least one criterion must match for the file to be concerned
		const matches = matchesPattern || matchesTags;

		if (this.settings.useIncludeMode) {
			// Include mode: process ONLY if file matches
			return matches;
		} else {
			// Exclude mode: process EXCEPT if file matches
			return !matches;
		}
	}

	/**
	 * Tests if the file matches the regex pattern
	 */
	private testPattern(file: TFile): boolean {
		if (!this.settings.excludePattern) {
			return false; // No pattern = no match
		}

		try {
			const regex = new RegExp(this.settings.excludePattern);
			return regex.test(file.path);
		} catch (error) {
			console.warn(
				"Reveal Folded: Invalid regex pattern:",
				this.settings.excludePattern,
				error,
			);
			return false;
		}
	}

	/**
	 * Tests if the file contains one of the specified tags
	 */
	private async testTags(file: TFile): Promise<boolean> {
		if (!this.settings.excludeTags) {
			return false; // No tags = no match
		}

		try {
			// Read file content to analyze tags
			const content = await this.app.vault.read(file);

			// Parse tags from settings (remove spaces and split by commas)
			const tagsToCheck = this.settings.excludeTags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0)
				.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)); // Add # if missing

			// Check if file contains one of the tags
			for (const tag of tagsToCheck) {
				if (content.includes(tag)) {
					return true;
				}
			}

			return false;
		} catch (error) {
			console.warn(
				"Reveal Folded: Error reading file tags:",
				file.path,
				error,
			);
			return false;
		}
	}

	/**
	 * Executes the reveal/collapse command
	 * @param file - The file to process
	 * @param collapseOnly - If true, collapse only without revealing
	 */
	private doCommand(file: TFile, collapseOnly: boolean = false) {
		// Always collapse first
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

		// If collapseOnly is true, stop here
		if (collapseOnly) {
			return;
		}

		// Otherwise, reveal the file
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
