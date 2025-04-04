import { a } from "react-spring";

export const instructionSets = {
	main: [
		{
			page: 1,
			title: "Introduction to MetroTopia",
			content: (
				<ul>
					<li>
						Click tiles on the map to learn about the area, build buildings, add
						green modifications, and change energy sources.
					</li>
					<li>
						The menu in the top right gives you information about everything on
						the map. You can also track your win conditions in the bottom right.
					</li>
					<li>
						The arrow buttons alongside the map reveal utilities you can connect
						to by building on those edges.{" "}
						<b>
							Build next to water treatment plants if you want to prevent excess
							groundwater pollution!
						</b>
					</li>
					<li>
						Don't be afraid to experiment and make mistakes. You can always
						restart and try a new strategy!
					</li>
					<li>
						Click the right arrow button to learn more tips and strategies. Or
						click the <b>Close button</b> to get started now and return here
						later by clicking the <b>? button</b> in the upper-left corner.
					</li>
				</ul>
			),
		},
		{
			page: 2,
			title: "Neighboring Cities",
			content: (
				<ul>
					<li>
						Start building along any edge (or on multiple edges), and then
						continue to build inward.
					</li>
					<li>
						When buildings from two (or more) edges connect to each other, they
						connect to each other's energy grids. You can go back and swap
						energy sources (for less polluting energy)!
					</li>
					<li>
						Check out the Energy Stats menu. Click an energy type and see which
						buildings are currently using it.
					</li>
					<li>
						<b>
							If you build in a corner, you automatically get a choice of energy
							from both edges!
						</b>
					</li>
				</ul>
			),
		},
		{
			page: 3,
			title: "Building Strategies",
			content: (
				<ul>
					<li>
						Check the graph in the Development Stats menu to make sure you're
						building the right mix of buildings. This affects your development
						satisfaction rating.
					</li>
					<li>
						Buildings connected to major transportation hubs give you more tax
						revenue when you build, but the increase in vehicles creates more
						air pollution.
					</li>
					<li>
						Sometimes you can't build a certain building. Hover over the
						building type to learn why.
					</li>
					<li>
						Once you've built a building, it's <b>permanent</b>, so choose
						wisely.
					</li>
					<li>
						See how many trees and animals will be lost by building on each
						parcel. Make sure you are preserving enough wildlife and trees!
					</li>
				</ul>
			),
		},
		{
			page: 4,
			title: "Air and Water Pollution",
			content: (
				<ul>
					<li>
						To avoid excess groundwater pollution, build off edges that have
						access to water treatment facilities.{" "}
						<b>You can't fix this later! </b>
					</li>
					<li>
						Every building creates some air and groundwater pollution, but you
						can reduce this by building smartly next to cities that have greener
						utilities.
					</li>
					<li>
						Remember to update your energy source if you connect buildings to
						another side of the map!
					</li>
				</ul>
			),
		},
		{
			page: 5,
			title: "Green Modifications",
			content: (
				<ul>
					<li>
						After you've built something, you can go back and add green
						modifications to boost wildlife, reduce heat, and improve air
						quality. These choices are also permanent, so choose wisely!
					</li>
					<li>
						Nature crossings help bring back a lot of smaller wildlife, but they
						designate every adjacent undeveloped parcel as a permanent nature
						preserve, <b>meaning you can't build there in the future.</b>
					</li>
				</ul>
			),
		},
		{
			page: 6,
			title: "How to Win",
			content: (
				<ul>
					<li>
						Keep an eye on your budget! You will lose the simulation if you run
						out of money too soon.
					</li>
					<li>
						If you satisfy all the conditions stated in the Win Conditions menu,
						you win! If you hit the target population but have failed any other
						win conditions, you lose.
					</li>
					<li>
						Don't forget that green modifications can restore trees, reduce
						pollution, and bring back wildlife!
					</li>
					<li>
						You may start over with a new randomized map by clicking the Reset
						button in the top left of the screen.
					</li>
				</ul>
			),
		},
	],
	ess: [
		{
			page: 1,
			title: "Introduction to Metrotopia",
			content: (
				<ul>
					<li>
						Click tiles on the map to learn about the area, build buildings, add
						green modifications, and change energy sources.
					</li>
					<li>
						The menu in the top right gives you information about everything on
						the map. You can also track your win conditions in the bottom right.
					</li>
					<li>
						The arrow buttons alongside the map reveal energy sources you can
						connect to by building on those edges.
					</li>
					<li>
						Don't be afraid to experiment and make mistakes. You can always
						restart and try a new strategy!
					</li>
					<li>
						Click the right arrow button to learn more tips and strategies. Or
						click the <b>Close button</b> to get started now and return here
						later by clicking the <b>? button</b> in the upper-left corner.
					</li>
				</ul>
			),
		},
		{
			page: 2,
			title: "Neighboring Cities",
			content: (
				<ul>
					<li>
						Start building along any edge (or on multiple edges), and then
						continue to build inward.
					</li>
					<li>
						When buildings from two (or more) edges connect to each other, they
						connect to each other's energy grids. You can go back and swap
						energy sources!
					</li>
					<li>
						Check out the Energy Stats menu. Click an energy type and see which
						buildings are currently using it.
					</li>
					<li>
						<b>
							If you build in a corner, you automatically get a choice of energy
							from both edges!
						</b>
					</li>
				</ul>
			),
		},
		{
			page: 3,
			title: "Building Strategies",
			content: (
				<ul>
					<li>
						Check the graph in the Development Stats menu to make sure you're
						building the right mix of buildings. This affects your development
						satisfaction rating.
					</li>
					<li>
						Sometimes you can't build a certain building. Hover over the
						building type to learn why.
					</li>
					<li>
						Once you've built a building, it's <b>permanent</b>, so choose
						wisely.
					</li>
					<li>
						See how many trees will be lost by building on each parcel. Make
						sure you are preserving enough of them!
					</li>
				</ul>
			),
		},
		{
			page: 4,
			title: "Green Modifications",
			content: (
				<ul>
					<li>
						After you've built something, you can go back and add green
						modifications to reduce heat. These choices are also permanent, so
						choose wisely!
					</li>
					<li>Some roof modifications reduce heat better than others.</li>
					<li>
						<b>
							You must add green modifications to help reduce the heat created
							by constructing buildings; keep the temperature increase to no
							more than 2.5°F!
						</b>
					</li>
				</ul>
			),
		},
		{
			page: 5,
			title: "How to Win",
			content: (
				<ul>
					<li>
						Keep an eye on your budget! You will lose the simulation if you run
						out of money too soon.
					</li>
					<li>
						If you satisfy all the conditions stated in the Win Conditions menu,
						you win! If you hit the target population but have failed any other
						win conditions, you lose.
					</li>
					<li>
						You may start over with a new randomized map by clicking the Reset
						button in the top left of the screen.
					</li>
				</ul>
			),
		},
	],
	aag: [
		{
			title: "Introduction to MetroTopia",
			content: (
				<ul>
					<li>Click tiles on the map to learn about the map.</li>
				</ul>
			),
		},
	],
	lwl: [
		{
			page: 1,
			title: "Introduction to MetroTopia",
			content: (
				<ul>
					<li>
						Click tiles on the map to learn about the area. Click tiles along
						any edge to construct new buildings. You can then expand inward.
					</li>
					<li>
						The menu in the top right gives you information about everything on
						the map. You can also track your win conditions in the bottom right.
					</li>
					<li>
						Don't be afraid to experiment and make mistakes. You can always
						restart and try a new strategy!
					</li>
					<li>
						Click the right arrow button to learn more tips and strategies, or
						click the <b>Close button</b> to get started now and return here
						later by clicking the <b>? button</b> in the upper-left corner.
					</li>
				</ul>
			),
		},
		{
			page: 2,
			title: "Building Strategies",
			content: (
				<ul>
					<li>
						Check the graph in the Development Stats menu to make sure you're
						constructing the right mix of buildings. This affects your
						development satisfaction rating.
					</li>
					<li>
						Sometimes you can't build a certain building. Hover over the
						building type to learn why.
					</li>
					<li>
						Once you've completed a building, it's <b>permanent</b>, so choose
						wisely.
					</li>
					<li>
						See how many anole lizards will be lost by building on each parcel.
						Make sure you are preserving enough of them!
					</li>
				</ul>
			),
		},
		{
			page: 3,
			title: "How to Win",
			content: (
				<ul>
					<li>
						Keep an eye on your budget! You will lose the simulation if you run
						out of money too soon.
					</li>
					<li>
						If you satisfy all the conditions stated in the Win Conditions menu,
						you win! If you build 15 buildings but fail to accomplish any other
						win conditions, you lose.
					</li>
					<li>
						You may start over with a new randomized map by clicking the{" "}
						<b>Reset button</b> in the top left of the screen.
					</li>
				</ul>
			),
		},
	],
	pp: [
		{
			page: 1,
			title: "Introduction to MetroTopia",
			content: (
				<ul>
					<li>
						Click tiles on the map to learn about the area and construct
						buildings along the map edges, building inward.
					</li>
					<li>
						The menu in the top right gives you information about everything on
						the map. You can also track your win conditions in the bottom right.
					</li>
					<li>
						The arrow buttons alongside the map reveal utilities you can connect
						to by building on those edges.
					</li>
					<li>
						Don't be afraid to experiment and make mistakes. You can always
						restart and try a new strategy!
					</li>
					<li>
						Click the right arrow button to learn more tips and strategies, or
						click the <b>Close button</b> to get started now and return here
						later by clicking the <b>? button</b> in the upper-left corner.
					</li>
				</ul>
			),
		},
		{
			page: 3,
			title: "Building Strategies",
			content: (
				<ul>
					<li>
						Check the graph in the Development Stats menu to make sure you're
						constructing the right mix of buildings. This affects your
						development satisfaction rating.
					</li>
					<li>
						Sometimes you can't build a certain building. Hover over the
						building type to learn why.
					</li>
					<li>
						Once you've completed a building, it's <b>permanent</b>, so choose
						wisely.
					</li>
					<li>
						See how many trees and animals will be lost by building on each
						parcel. Make sure you are preserving enough wildlife and trees!
					</li>
				</ul>
			),
		},
		{
			page: 4,
			title: "Air Pollution",
			content: (
				<ul>
					<li>
						Every building creates some air pollution, but you can reduce this
						by building smartly next to cities that have greener utilities.
					</li>
				</ul>
			),
		},
		{
			page: 6,
			title: "How to Win",
			content: (
				<ul>
					<li>
						Keep an eye on your budget! You will lose the simulation if you run
						out of money too soon.
					</li>
					<li>
						If you satisfy all the conditions stated in the Win Conditions menu,
						you win! If you hit the target population but fail to accomplish any
						other win conditions, you lose.
					</li>
					<li>
						You may start over with a new randomized map by clicking the Reset
						button in the top left of the screen.
					</li>
				</ul>
			),
		},
	],
	ee: [
		{
			page: 1,
			title: "Introduction to MetroTopia",
			content: (
				<ul>
					<li>
						Click tiles on the map to learn about the area and construct
						buildings along the map edges, building inward.
					</li>
					<li>
						The menu in the top right gives you information about everything on
						the map. You can also track your win conditions in the bottom right.
					</li>
					<li>
						The arrow buttons alongside the map reveal transportation hubs you
						can connect to by building on those edges. These increase your tax
						revenue!
					</li>
					<li>
						Don't be afraid to experiment and make mistakes. You can always
						restart and try a new strategy.
					</li>
					<li>
						Click the right arrow button to learn more tips and strategies, or
						click the <b>Close button</b> to get started now and return here
						later by clicking the <b>? button</b> in the upper-left corner.
					</li>
				</ul>
			),
		},
		{
			page: 2,
			title: "Zone Connections",
			content: (
				<ul>
					<li>
						You must build three different, separate zones: residential and
						services, commercial, and industrial.
					</li>
					<li>
						You must also connect all three zones with a{" "}
						<b>commercial marketplace</b>. Except for this, your zones cannot
						touch each other.
					</li>
					<li>
						You must also connect to <b>three different sides</b> of the map.
						Two of those should have transportation hubs!
					</li>
				</ul>
			),
		},
		{
			page: 3,
			title: "Building Strategies",
			content: (
				<ul>
					<li>
						Check the graph in the Development Stats menu to make sure you're
						constructing the right mix of buildings. This affects your
						development satisfaction rating.
					</li>
					<li>
						Sometimes you can't build a certain building. Hover over the
						building type to learn why.
					</li>
					<li>
						Once you've built a building, it's <b>permanent</b>, so choose
						wisely.
					</li>
				</ul>
			),
		},
		{
			page: 4,
			title: "Taxation",
			content: (
				<ul>
					<li>
						You need to earn $30,000 in tax revenue as one of your win
						conditions.
					</li>
					<li>
						Most buildings award you a certain amount of tax dollars. Some
						buildings provide taxes (like sales tax) that others do not.
					</li>
					<li>
						Constructing buildings next to transportation hubs can increase the
						amount of people accessing them, and thus provide more tax revenue.
					</li>
				</ul>
			),
		},
		{
			page: 6,
			title: "How to Win",
			content: (
				<ul>
					<li>
						Keep an eye on your budget! You will lose the simulation if you run
						out of money too soon.
					</li>
					<li>
						If you satisfy all the conditions stated in the Win Conditions menu,
						you win! If you hit the target population but fail to achieve any
						other win conditions, you lose.
					</li>
					<li>
						You may start over with a new randomized map by clicking the{" "}
						<b>Reset button</b> in the top left of the screen.
					</li>
				</ul>
			),
		},
	],
	sandbox: [
		{
			page: 1,
			title: "Introduction to MetroTopia",
			content: (
				<ul>
					<li>Click tiles on the map to learn about the map.</li>
					<li>
						Buildings on the edge of the map connect to energy sources that are off the grid. Any adjacent buildings will also connect to these energy sources.
					</li>
					<li>
						The menu in the top right gives you information about everything on the map.
					</li>
					<li>
						In sandbox mode there are no win conditions, so you can build whatever you want!
					</li>
				</ul>
			),
		},
	],
};
