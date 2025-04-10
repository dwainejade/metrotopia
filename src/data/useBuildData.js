import useResourcesStore from "../stores/resourcesStore";

export const useBuildData = () => {
	const { resources } = useResourcesStore();

	const formatCurrency = (amount) => {
		return amount.toLocaleString("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		});
	};

	return {
		main: {
			title: "MetroTopia: Build for Balance",
			description: `To accommodate a growing population, a nature preserve situated among four cities is being considered for urbanization. Your task is to plan this new city’s development while preserving as many trees as possible to minimize the heat island effect. You can do this by making green modifications to buildings after you construct them. Of course, you also need to keep your new citizens happy and design the city within the budget of ${formatCurrency(
				resources.funds.starting
			)} MetroBucks, your city’s currency.

            Remember to carefully evaluate the impact of building on any given parcel before you begin construction! Let’s get started!`,
		},
		ess: {
			title: "MetroTopia: Temperature Check",
			description: `To accommodate a growing population, a nature preserve situated among four cities is being considered for urbanization. Your task is to plan this new city’s development, while preserving as many trees as possible minimizing the heat island effect, which you can do by making green modifications to buildings after you construct them. Of course, you also need to keep your new citizens happy and design the city within the budget of ${formatCurrency(
				resources.funds.starting
			)} MetroBucks, your city’s currency.

            Remember to carefully evaluate the impact of building on any given parcel before beginning construction! Let’s get started!`,
		},
		static: {
			title: "MetroTopia: Static Template",
			description: `Click on each tile to learn about the map.`,
		},
		ee: {
			title: "MetroTopia: Economic Effects",
			description: `To accommodate a growing population, a nature preserve situated among four cities is being considered for urbanization. Your task is to plan this new city’s development while promoting as much economic development—and generating taxes—as possible, all while abiding by proper zoning laws. Of course, you also need to keep your new citizens happy and design the city within the budget of ${formatCurrency(
				resources.funds.starting
			)} MetroBucks, your city’s currency.

Remember to carefully evaluate the impact of building on any given parcel before you begin construction! Let’s get started!`,
		},
		lwl: {
			title: "MetroTopia: Living With Lizards",
			description: `Your task is to rebuild an area that was devastated by a hurricane a few years ago, while simultaneously prioritizing the preservation of the local anole lizard population. As you plan the reconstruction, focus on minimizing the loss of habitat for these lizards. You will need to carefully evaluate each area before beginning any construction to ensure that their natural environment remains as protected as possible. In addition, the project must be completed within a budget of ${formatCurrency(
				resources.funds.starting
			)} MetroBucks, the local currency.

Balancing the needs of the human population with the conservation of these lizards will be essential for creating a sustainable and thriving community. Let's get started!`,
		},
		pp: {
			title: "MetroTopia: Policy Power",
			description: `To accommodate a growing population, a nature preserve situated among four cities is being considered for urbanization. Your task is to plan this new city’s development while adhering to new environmental protection policies set forth by the state government. Not only do you need to preserve a set amount of trees and wildlife and control air pollution, but you need to adhere to city zoning rules that clearly separate different building types. Of course, you also need to keep your new citizens happy and design the city within the budget of ${formatCurrency(
				resources.funds.starting
			)} MetroBucks, your city’s currency. 

Remember to carefully evaluate the impact of building on any given parcel before you begin construction! Let’s get started!`,
		},
		aag: {
			title: "MetroTopia: At a Glance",
			description: `In this activity, you will explore how different places and their environments are interconnected. You’ll navigate through a beachfront city, a fishing industry along a river, a small rural town, a lumber and paper industrial complex, and even isolated country homes. By clicking on each tile, you can learn more about each structure and how it interacts with the surrounding environment. This experience will help you understand the delicate balance between human activities and the natural world. Let's get started!`,
		},
		sandbox: {
			title: "MetroTopia: Sandbox Mode",
			description: `In this sandbox mode, you have the freedom to build without any restrictions. You can place buildings wherever you like, regardless of zoning laws or environmental considerations. This mode allows you to experiment with different layouts and designs without worrying about the consequences. Let's get started!`,
		},
	};
};

export default useBuildData;
