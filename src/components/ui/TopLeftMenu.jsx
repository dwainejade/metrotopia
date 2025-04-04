import React, { useEffect } from "react";
import Tippy, { useSingleton } from "@tippyjs/react";
import { DiceThree, Car, FilmSlate } from "phosphor-react";
import useGridStore from "../../stores/gridStore";
import useAudioStore from "../../stores/audioStore";
import useTransitionStore from "../../stores/transitionStore";

const TopLeftMenu = ({ activeIcon, setActiveIcon, version }) => {
	const {
		placeRandomBuildings,
		setCurrentModal,
		devMode,
		setDevMode,
		toggleCarMovement,
	} = useGridStore();
	const {
		toggleMusic,
		isMusicPlaying,
		isMuted,
		toggleMute,
		toggleEnvironmentalSounds,
		playSound,
	} = useAudioStore();
	const { isVisible, endTransition, startTransition } = useTransitionStore();

	const handleMouseDown = (buttonName) => {
		if (buttonName === "music") {
			playSound("popUpSound2");
		} else if (buttonName === "sound") {
			playSound("popUpSound2", "muteButton");
		}
		if (buttonName === "info" || buttonName === "reset") {
			setActiveIcon(buttonName);
		}
	};

	const handleMouseUp = () => {
		if (activeIcon !== "info" && activeIcon !== "reset") {
			setActiveIcon(null);
		}
	};

	useEffect(() => {
		const handleKeyUp = (event) => {
			if (event.key === "~") {
				setDevMode(!devMode);
			}
		};
		document.addEventListener("keyup", handleKeyUp);
		return () => {
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, [devMode, setDevMode]);

	const handleMusic = () => {
		toggleMusic();
		toggleEnvironmentalSounds();
	};

	const toggleFade = () => {
		if (isVisible) {
			endTransition();
		} else {
			startTransition();
		}
	};

	const [source, target] = useSingleton();

	return (
		<div className="top-left-controls">
			<Tippy singleton={source} moveTransition="transform 0.2s ease-out" animation="shift-away-subtle" />
			<Tippy content="Reset Game" singleton={target}>
				<button
					className={`control-button reset ${activeIcon === "reset" ? "active" : ""
						}`}
					onClick={() => setCurrentModal("Reset")}
					onMouseDown={() => handleMouseDown("reset")}
					onMouseUp={handleMouseUp}
					aria-label="Reset Button"
				/>
			</Tippy>

			<Tippy
				content={isMusicPlaying ? "Toggle Music Off" : "Toggle Music On"}
				singleton={target}
			>
				<button
					className={`control-button music ${activeIcon === "music" ? "active" : ""
						} ${isMusicPlaying ? "playing" : "not-playing"} ${isMuted ? "muted" : ""
						}`}
					onClick={handleMusic}
					onMouseDown={() => handleMouseDown("music")}
					onMouseUp={handleMouseUp}
					disabled={isMuted}
					aria-label={isMusicPlaying ? "Toggle Music Off" : "Toggle Music On"}
				/>
			</Tippy>

			<Tippy
				content={isMuted ? "Unmute Sound" : "Mute Sound"}
				singleton={target}
			>
				<button
					className={`control-button sound ${activeIcon === "sound" ? "active" : ""
						} ${isMuted ? "muted" : "unmuted"}`}
					onClick={() => toggleMute(true)}
					onMouseDown={() => handleMouseDown("sound")}
					onMouseUp={handleMouseUp}
					aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
				/>
			</Tippy>

			{version !== "aag" && (
				<Tippy
					content="Instructions and Gameplay Tips"
					singleton={target}
				>
					<button
						className={`control-button info ${activeIcon === "info" ? "active" : ""
							}`}
						onClick={() => setCurrentModal("Instructions")}
						onMouseDown={() => handleMouseDown("info")}
						onMouseUp={handleMouseUp}
						aria-label="Help Button"
					/>
				</Tippy>
			)}

			{devMode && (
				<>
					<Tippy content="Randomize Buildings" singleton={target}>
						<button className="dev-btn" onClick={placeRandomBuildings}>
							<DiceThree size={22} weight="bold" />
						</button>
					</Tippy>

					<Tippy content="Pause Car Movement" singleton={target}>
						<button className="dev-btn" onClick={toggleCarMovement}>
							<Car size={22} weight="bold" />
						</button>
					</Tippy>

					<Tippy
						content={isVisible ? "End Transition" : "Start Transition"}
						singleton={target}
					>
						<button
							className={`dev-btn ${isVisible ? "active" : ""}`}
							onClick={toggleFade}
						>
							<FilmSlate size={32} />
						</button>
					</Tippy>
				</>
			)}
		</div>
	);
};

export default TopLeftMenu;
