import useVersionStore, { APP_VERSIONS } from './versionStore';

// Selects the appropriate store based on the current version.
const useGridStore = () => {
	const { current } = useVersionStore((state) => ({
		current: state.current,
	}));

	const version = APP_VERSIONS[current] || APP_VERSIONS.main;
	return version.gridStore();
};

export default useGridStore;