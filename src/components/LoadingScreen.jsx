import React, { useEffect, useState } from "react";
import { TextureLoader } from "three";
import useTextureStore from "../stores/textureStore";
import useAudioStore from "../stores/audioStore";

const LoadingScreenWithTexturesAndAudio = ({ onLoaded }) => {
	const { textureUrls, imageUrls, setPreloadedTextures, setPreloadedUIImages } =
		useTextureStore();
	const { preloadSounds, music, soundEffects } = useAudioStore();
	const [loadedTextures, setLoadedTextures] = useState(0);
	const [loadedUIImages, setLoadedUIImages] = useState(0);
	const [loadedAudios, setLoadedAudios] = useState(0);
	const [progress, setProgress] = useState(0);
	const [errors, setErrors] = useState([]);

	const totalTextures = Object.keys(textureUrls).length;
	const totalUIImages = Object.keys(imageUrls).length;
	const totalAudios =
		Object.keys(music).length + Object.keys(soundEffects).length;
	const totalItems = totalTextures + totalUIImages + totalAudios;

	useEffect(() => {
		const textureLoader = new TextureLoader();
		const textures = {};
		const uiImages = {};
		const loaded = {
			textures: 0,
			uiImages: 0,
			audios: 0,
		};

		const checkAllLoaded = () => {
			const total = loaded.textures + loaded.uiImages + loaded.audios;
			const currentProgress = Math.round((total / totalItems) * 100);
			setProgress(currentProgress);

			if (total === totalItems) {
				setPreloadedTextures(textures);
				setPreloadedUIImages(uiImages);
				onLoaded();
			}
		};

		// Texture loading
		Object.entries(textureUrls).forEach(([key, url]) => {
			textureLoader.load(
				url,
				(texture) => {
					textures[key] = texture;
					setLoadedTextures((prev) => prev + 1);
					loaded.textures++;
					checkAllLoaded();
				},
				null,
				(error) => {
					console.error(`Error loading texture ${key}:`, error);
					setErrors((prev) => [
						...prev,
						`Failed to load texture ${key}: ${error.message}`,
					]);
					loaded.textures++;
					checkAllLoaded();
				}
			);
		});

		// UI Image loading
		Object.entries(imageUrls).forEach(([key, url]) => {
			const img = new Image();
			img.onload = () => {
				uiImages[key] = img;
				setLoadedUIImages((prev) => prev + 1);
				loaded.uiImages++;
				checkAllLoaded();
			};
			img.onerror = (error) => {
				console.error(`Error loading UI image ${key}:`, error);
				setErrors((prev) => [
					...prev,
					`Failed to load UI image ${key}: ${error.message}`,
				]);
				loaded.uiImages++;
				checkAllLoaded();
			};
			img.src = url;
		});

		// Audio loading
		const howlerLoadListener = () => {
			loaded.audios++;
			setLoadedAudios((prev) => prev + 1);
			checkAllLoaded();
		};

		// Add the load listener to each sound in both music and soundEffects
		const addLoadListenerToSounds = (sounds) => {
			Object.values(sounds).forEach((sound) => {
				if (sound.sound) {
					sound.sound.once("load", howlerLoadListener);
				} else {
					// If the sound hasn't been created yet, we'll count it as loaded
					howlerLoadListener();
				}
			});
		};

		addLoadListenerToSounds(music);
		addLoadListenerToSounds(soundEffects);

		const timeoutId = setTimeout(() => {
			if (loadedCount < totalItems) {
				console.warn(
					`Loading is taking longer than expected. Loaded ${loadedCount}/${totalItems} items.`
				);
			}
		}, 10000);

		return () => {
			clearTimeout(timeoutId);
			// Remove listeners when component unmounts
			const removeLoadListenerFromSounds = (sounds) => {
				Object.values(sounds).forEach((sound) => {
					if (sound.sound) {
						sound.sound.off("load", howlerLoadListener);
					}
				});
			};
			removeLoadListenerFromSounds(music);
			removeLoadListenerFromSounds(soundEffects);
		};
	}, [
		textureUrls,
		imageUrls,
		setPreloadedTextures,
		setPreloadedUIImages,
		totalTextures,
		totalUIImages,
		totalAudios,
		onLoaded,
		preloadSounds,
		music,
		soundEffects,
	]);

	return (
		<div style={styles.loadingScreen}>
			<div style={styles.loadingContent}>
				<h1 style={styles.heading}>LOADING...</h1>
				<div style={styles.progressBarContainer}>
					<div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
				</div>
				<p style={styles.text}>
					{progress}% loaded ({loadedTextures}/{totalTextures} textures,
					{loadedUIImages}/{totalUIImages} UI images,
					{loadedAudios}/{totalAudios} audios)
				</p>
				{errors.length > 0 && (
					<div style={styles.errorContainer}>
						{errors.map((error, index) => (
							<p key={index} style={styles.errorText}>
								{error}
							</p>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

const styles = {
	loadingScreen: {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
		zIndex: 100,
	},
	loadingContent: {
		textAlign: "center",
		color: "#fff",
		fontFamily: "Arial, sans-serif",
	},
	heading: {
		fontSize: "2rem",
		marginBottom: "20px",
		color: "#96b976",
	},
	progressBarContainer: {
		width: "80%",
		height: "25px",
		backgroundColor: "#e4e4e4",
		borderRadius: "15px",
		overflow: "hidden",
		margin: "0 auto 20px auto",
	},
	progressBar: {
		height: "100%",
		backgroundColor: "#006839",
		borderRadius: "15px",
	},
	text: {
		fontSize: "1.2rem",
	},
	errorContainer: {
		marginTop: "10px",
		color: "#ff0000",
	},
	errorText: {
		fontSize: "1rem",
	},
};

export default LoadingScreenWithTexturesAndAudio;
