import { Plugin } from "obsidian";

export default class RevelFolded extends Plugin {
	override onload() {
		this.addCommand({
			id: "reveal-active-file-folded",
			name: "Reveal active file in folded file explorer",
			icon: "folder-search",
			callback: () => {
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
				setTimeout(
					() =>
						this.app.commands.executeCommandById(
							"file-explorer:reveal-active-file",
						),
					100,
				);
			},
		});
	}
}
