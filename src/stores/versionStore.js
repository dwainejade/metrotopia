import { create } from "zustand";
import useMainGridStore from "./mainGridStore";
import useEssGridStore from "./essGridStore";
import useMainResourcesStore from "./mainResourcesStore";
import useEssResourcesStore from "./essResourcesStore";
import useEeGridStore from "./eeGridStore";
import useEeResourcesStore from "./eeResourcesStore";
import useLwlGridStore from "./lwlGridStore";
import useLwlResourcesStore from "./lwlResourcesStore";
import useAagGridStore from "./aagGridStore";
import useAagResourcesStore from "./aagResourcesStore";
import usePpGridStore from "./ppGridStore";
import usePpResourcesStore from "./ppResourcesStore";
import useSandboxGridStore from "./sandboxGridStore";
import useSandboxResourcesStore from "./sandboxResourcesStore";

// Configurations for different versions
export const APP_VERSIONS = {
	main: {
		id: "main",
		paths: ["", "main", "city-builder-interactive"], // matches /, /main, or /city-builder-interactive
		title: "MetroTopia: Build for Balance",
		gridStore: useMainGridStore,
		resourceStore: useMainResourcesStore,
	},
	ess: {
		id: "ess",
		paths: ["ess"],
		title: "MetroTopia: Temperature Check",
		gridStore: useEssGridStore,
		resourceStore: useEssResourcesStore,
	},
	aag: {
		id: "aag",
		paths: ["aag"],
		title: "MetroTopia: At a Glance",
		gridStore: useAagGridStore,
		resourceStore: useAagResourcesStore,
	},
	ee: {
		id: "ee",
		paths: ["ee"],
		title: "MetroTopia: Economics Effects",
		gridStore: useEeGridStore,
		resourceStore: useEeResourcesStore,
	},
	lwl: {
		id: "lwl",
		paths: ["lwl"],
		title: "MetroTopia: Living With Lizards",
		gridStore: useLwlGridStore,
		resourceStore: useLwlResourcesStore,
	},
	pp: {
		id: "pp",
		paths: ["pp"],
		title: "MetroTopia: Policy Power",
		gridStore: usePpGridStore,
		resourceStore: usePpResourcesStore,
	},
	nr: {
		id: "sandbox",
		paths: ["sandbox"],
		title: "MetroTopia: Sandbox",
		gridStore: useSandboxGridStore,
		resourceStore: useSandboxResourcesStore,
	},
};

// Create the version store
const useVersionStore = create((set) => ({
	current: "main", // default version
	title: APP_VERSIONS.main.title,
	path: "",
	setVersion: (versionId, title, path) =>
		set({ current: versionId, title, path }),
}));

export default useVersionStore;
