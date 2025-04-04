import useVersionStore, { APP_VERSIONS } from './versionStore';

// Selects the appropriate store based on the current version.
const useResourcesStore = () => {
	const { current } = useVersionStore((state) => ({
		current: state.current,
	}));

	const version = APP_VERSIONS[current] || APP_VERSIONS.main;

	return version.resourceStore();
};

export default useResourcesStore;