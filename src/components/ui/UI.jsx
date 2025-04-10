// src/components/ui/EcoMetropolisUI.jsx

import React, { useEffect, useState } from "react";
import TopLeftMenu from "./TopLeftMenu";
import TopRightMenu from "./top-right-menu/TopRightMenu";
import TopRightMenuESS from "../ess/TopRightMenuESS";
import BottomRightUI from "./BottomRightUI";
import useVersionStore from "@src/stores/versionStore";
import useStore from "@src/stores/gridStore";
import useResourcesStore from "@src/stores/resourcesStore";
import useAudioStore from "@src/stores/audioStore";
import AudioPlayer from "@src/helpers/AudioPlayer";
import "@src/styles/UI.less";

import BuildingInfoMenu from "./BuildingInfoMenu";
import SandboxConstructionMenu from "../sandbox/SandboxConstructionMenu";
import ConstructionMenu from "./ConstructionMenu";
import ESSBuildingInfoMenu from "./ESSBuildingInfoMenu";
import ESSConstructionMenu from "./ESSConstructionMenu";
import PPConstructionMenu from "./pp/PPConstructionMenu";
import PPBuildingInfoMenu from "./pp/PPBuildingInfoMenu";
import PPTopRightMenu from "./pp/PPTopRightMenu";
import PPBottomRightUI from "./pp/PPBottomRightUI";
import LWLBuildingInfoMenu from "./LWLBuildlingInfoMenu";
import LWLConstructionMenu from "./LWLConstructionMenu";
import EEBuildingInfoMenu from "../ee/EEBuildingInfoMenu";
import EEConstructionMenu from "../ee/EEConstructionMenu";
import EETopRightMenu from "../ee/EETopRightMenu";
import AAGInfoModal from "../aag/AAGInfoModal";

import SandboxTopRightMenu from "../sandbox/SandboxTopRightMenu";

import TopRightMenuLWL from "../lwl/TopRightMenuLWL";
import CameraControlsUI from "./CameraControlsUI";
import InstructionsModal from "./InstructionsModal";
import NaturePreserveModal from "./NaturePreserveModal";
import ResetModal from "./ResetModal";
import AAGResetModal from "../aag/AAGResetModal";
import EndModal from "./EndGameModal";

const EcoMetropolisUI = () => {
	const { current: version } = useVersionStore(); // Correctly destructured 'current'
	const {
		selectedTile,
		currentOpenModal,
		setCurrentModal,
		setSelectedTile,
		setShowCellHighlighter,
		tiles,
		clearPreview,
		activeTab,
		setActiveTab,
		selectedTopRightMenuItem: expandedMenu,
		setSelectedTopRightMenuItem: setExpandedMenu,
	} = useStore();
	const { resources, gameWon, gameLost, checkWinConditions } =
		useResourcesStore();

	const { playSound } = useAudioStore();
	// Removed unused state variables
	const [activeIcon, setActiveIcon] = useState(null);

	const selectTab = (key) => {
		setActiveTab(activeTab === key ? null : key);
		setExpandedMenu(expandedMenu === key ? null : key);
		// Play menu click sound
		playSound("popUpSound2");
	};

	const handleBuild = (constructionData) => {
		// Handle the construction data
		setCurrentModal(null);
	};

	const handleCancel = () => {
		playSound("categoryClickSound");
		setCurrentModal(null);
		setShowCellHighlighter(false);
		setSelectedTile(null);
		clearPreview();
	};

	// Effect to check win conditions whenever resources or gameWon changes
	useEffect(() => {
		checkWinConditions();
	}, [resources, gameWon, gameLost, checkWinConditions]);

	// Handle closing the end modal
	const handleCloseEndModal = () => {
		setCurrentModal(null);
	};

	// General handle close function for modals
	const handleClose = () => {
		playSound("categoryClickSound");
		setCurrentModal(null);
		setSelectedTile(null);
		setShowCellHighlighter(false);
		setActiveIcon(null);
	};

	return (
		<div className="ecometropolis-ui">
			<AudioPlayer />
			<TopLeftMenu activeIcon={activeIcon} setActiveIcon={setActiveIcon} version={version} />
			
			{version === "main" && (
				<TopRightMenu
					expandedMenu={expandedMenu}
					activeTab={activeTab}
					selectTab={selectTab}
				/>
			)}
			{version === "ess" && (
				<TopRightMenuESS
					expandedMenu={expandedMenu}
					activeTab={activeTab}
					selectTab={selectTab}
				/>
			)}
			{version === "pp" && (
				<PPTopRightMenu
					expandedMenu={expandedMenu}
					activeTab={activeTab}
					selectTab={selectTab}
				/>
			)}
			{version === "lwl" && (
				<TopRightMenuLWL
					expandedMenu={expandedMenu}
					activeTab={activeTab}
					selectTab={selectTab}
				/>
			)}
			{version === "ee" && (
				<EETopRightMenu
					expandedMenu={expandedMenu}
					activeTab={activeTab}
					selectTab={selectTab}
				/>
			)}
			{version === "sandbox" && (
				<SandboxTopRightMenu
					expandedMenu={expandedMenu}
					activeTab={activeTab}
					selectTab={selectTab}
				/>
			)}

			{version === "pp" && <PPBottomRightUI />}
			{version !== "pp" && version !== "aag" && <BottomRightUI />}

			<CameraControlsUI />

			{/* Conditional Rendering for Construction Menus */}
			{currentOpenModal === "Construction" && selectedTile && (
				<>
					{version === "main" && (
						<ConstructionMenu onBuild={handleBuild} onCancel={handleCancel} />
					)}
					{version === "sandbox" && (
						<SandboxConstructionMenu onBuild={handleBuild} onCancel={handleCancel} />
					)}
					{version === "ess" && <ESSConstructionMenu onCancel={handleCancel} />}
					{version === "pp" && (
						<PPConstructionMenu onBuild={handleBuild} onCancel={handleCancel} />
					)}
					{version === "lwl" && <LWLConstructionMenu onCancel={handleCancel} />}
					{version === "ee" && <EEConstructionMenu onCancel={handleCancel} />}
					{version === "sandbox" && (
						<ConstructionMenu onBuild={handleBuild} onCancel={handleCancel} />
					)}
				</>
			)}
			{/* Conditional Rendering for Building Info Menus */}
			{currentOpenModal === "BuildingInfo" && selectedTile && (
				<>
					{version === "main" && (
						<BuildingInfoMenu onCancel={handleCancel} key={selectedTile} />
					)}
					{version === "ess" && (
						<ESSBuildingInfoMenu onCancel={handleCancel} key={selectedTile} />
					)}
					{version === "pp" && (
						<PPBuildingInfoMenu onCancel={handleCancel} key={selectedTile} />
					)}
					{version === "lwl" && (
						<LWLBuildingInfoMenu onCancel={handleCancel} key={selectedTile} />
					)}
					{version === "ee" && (
						<EEBuildingInfoMenu onCancel={handleCancel} key={selectedTile} />
					)}
					{version === "sandbox" && (
						<BuildingInfoMenu onCancel={handleCancel} key={selectedTile} />
					)}
				</>
			)}

			{version === "aag" && selectedTile && <AAGInfoModal onCancel={handleCancel} key={selectedTile} />}

			{/* Conditional Rendering for Other Modals */}
			{currentOpenModal === "Instructions" && (
				<InstructionsModal onClose={handleClose} />
			)}

			{currentOpenModal === "Reset" && version !== "aag" && <ResetModal onClose={handleClose} />}
			{currentOpenModal === "Reset" && version === "aag" && <AAGResetModal onClose={handleClose} />}

			{currentOpenModal === "NaturePreserve" && version !== "aag" && (
				<NaturePreserveModal tile={tiles[selectedTile]} onClose={handleClose} />
			)}

			{currentOpenModal === "End" && (
				<EndModal
					gameWon={gameWon}
					gameLost={gameLost}
					onClose={handleCloseEndModal}
				/>
			)}
		</div>
	);
};

export default EcoMetropolisUI;
