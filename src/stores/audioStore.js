import { create } from 'zustand';
import { Howl } from 'howler';
import useMainGridStore from './mainGridStore';
import useEssGridStore from './essGridStore';

const getAssetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

const useAudioStore = create((set, get) => ({
  music: {
    new_loop: {
      sound: null,
      url: 'assets/audio/music/new_loop.mp3',
      volume: 0.4,
      loop: true,
    },
    new_fade_out: {
      sound: null,
      url: 'assets/audio/music/new_fade-out.mp5',
      volume: 0.4,
      loop: true,
    },
  },
  soundEffects: {
    startSound: {
      sound: null,
      url: 'assets/audio/sounds/start.mp3',
      volume: 0.3,
    },
    buildSound: {
      sound: null,
      url: 'assets/audio/sounds/build.mp3',
      volume: 0.6,
    },
    confirmModsSound: {
      sound: null,
      url: 'assets/audio/sounds/build_mods.mp3',
      volume: 0.2,
    },
    powerModSound: {
      sound: null,
      url: 'assets/audio/sounds/power_mod.mp3',
      volume: 0.3,
    },
    buttonSound: {
      sound: null,
      url: 'assets/audio/sounds/button_click.mp3',
      volume: 0.6,
    },
    popUpSound: {
      sound: null,
      url: 'assets/audio/sounds/bubble.mp3',
      volume: 0.6,
    },
    popUpSound2: {
      sound: null,
      url: 'assets/audio/sounds/bubble_2.wav',
      volume: 0.6,
    },
    popUpSound3: {
      sound: null,
      url: 'assets/audio/sounds/bubble_3.mp3',
      volume: 0.5,
    },
    menuClickSound: {
      sound: null,
      url: 'assets/audio/sounds/menu_options.mp3',
      volume: 0.4,
    },
    categoryClickSound: {
      sound: null,
      url: 'assets/audio/sounds/tab.mp3',
      volume: 0.4,
    },
    resetSound: {
      sound: null,
      url: 'assets/audio/sounds/reset.mp3',
      volume: 0.6,
    },
  },
  environmentalSounds: {
    cityAmbiance: {
      sound: null,
      url: 'assets/audio/environmental/BOOM Library - Chirpy Skylines - Traffic City Ambience New York Broadway Skyline_1.mp3',
      volume: 0.2, // Reduced by 30%
      loop: true,
    },
    natureAmbiance: {
      sound: null,
      url: 'assets/audio/environmental/refocus - Birds chirping and wind blowing through the trees in the forest_1.mp3',
      volume: 0.2, // Reduced by 30%
      loop: true,
    },
  },

  currentMusicTrack: 'new_loop',
  currentEnvironmentalSound: null,
  isEnvironmentalSoundPlaying: false,
  isMusicPlaying: false,
  isMuted: false,
  wasPlayingBeforeMute: false,
  wasEnvironmentalPlayingBeforeMute: false,

  setMuted: (isMuted) => {
    const {
      music,
      environmentalSounds,
      currentMusicTrack,
      isEnvironmentalSoundPlaying,
    } = get();

    if (isMuted) {
      // Store current playing states
      const musicWasPlaying =
        music[currentMusicTrack]?.sound?.playing() || false;

      // Pause music if playing
      if (musicWasPlaying && music[currentMusicTrack].sound) {
        music[currentMusicTrack].sound.pause();
      }

      // Pause environmental sounds if playing
      if (isEnvironmentalSoundPlaying) {
        Object.values(environmentalSounds).forEach((soundConfig) => {
          if (soundConfig.sound?.playing()) {
            soundConfig.sound.pause();
          }
        });
      }

      set({
        isMuted,
        wasPlayingBeforeMute: musicWasPlaying,
        wasEnvironmentalPlayingBeforeMute: isEnvironmentalSoundPlaying,
        isMusicPlaying: false,
        isEnvironmentalSoundPlaying: false,
      });
    } else {
      // Retrieve saved states
      const { wasPlayingBeforeMute, wasEnvironmentalPlayingBeforeMute } = get();

      // Resume music if it was playing
      if (wasPlayingBeforeMute && music[currentMusicTrack].sound) {
        music[currentMusicTrack].sound.play();
      }

      // Resume environmental sounds if they were playing
      if (wasEnvironmentalPlayingBeforeMute) {
        Object.values(environmentalSounds).forEach((soundConfig) => {
          if (soundConfig.sound) {
            soundConfig.sound.play();
          }
        });
      }

      set({
        isMuted,
        wasPlayingBeforeMute: false,
        wasEnvironmentalPlayingBeforeMute: false,
        isMusicPlaying: wasPlayingBeforeMute,
        isEnvironmentalSoundPlaying: wasEnvironmentalPlayingBeforeMute,
      });
    }
  },

  toggleMute: () => {
    const { isMuted, setMuted } = get();
    setMuted(!isMuted);
  },

  cycleMusic: () => {
    const { music, currentMusicTrack, toggleMusic } = get();
    const musicTracks = Object.keys(music);
    const currentIndex = musicTracks.indexOf(currentMusicTrack);
    const nextIndex = (currentIndex + 1) % musicTracks.length;
    const nextTrack = musicTracks[nextIndex];

    if (
      music[currentMusicTrack].sound &&
      music[currentMusicTrack].sound.playing()
    ) {
      music[currentMusicTrack].sound.stop();
    }
    set({ currentMusicTrack: nextTrack });

    toggleMusic();
  },

  preloadSounds: () => {
    const { music, soundEffects, environmentalSounds } = get();
    const preloadCategory = (category) => {
      Object.entries(category).forEach(([id, config]) => {
        if (!config.sound) {
          const sound = new Howl({
            src: [getAssetPath(config.url)], // Only place we need getAssetPath
            volume: config.volume,
            loop: config.loop || false,
          });
          set((state) => ({
            [category === music
              ? 'music'
              : category === soundEffects
              ? 'soundEffects'
              : 'environmentalSounds']: {
              ...state[
                category === music
                  ? 'music'
                  : category === soundEffects
                  ? 'soundEffects'
                  : 'environmentalSounds'
              ],
              [id]: { ...config, sound },
            },
          }));
        }
      });
    };

    preloadCategory(music);
    preloadCategory(soundEffects);
    preloadCategory(environmentalSounds);
  },

  playSound: (id, bypass = false) => {
    const { music, soundEffects, environmentalSounds, isMuted } = get();

    if (isMuted && !bypass) return;

    const soundConfig =
      music[id] || soundEffects[id] || environmentalSounds[id];
    if (!soundConfig) {
      console.error(`Invalid sound ID: ${id}`);
      return;
    }

    if (!soundConfig.sound) {
      const sound = new Howl({
        src: [soundConfig.url],
        volume: soundConfig.volume,
        loop: soundConfig.loop || false,
      });
      set((state) => ({
        [music[id]
          ? 'music'
          : soundEffects[id]
          ? 'soundEffects'
          : 'environmentalSounds']: {
          ...state[
            music[id]
              ? 'music'
              : soundEffects[id]
              ? 'soundEffects'
              : 'environmentalSounds'
          ],
          [id]: { ...soundConfig, sound },
        },
      }));
      sound.play();
    } else {
      soundConfig.sound.play();
    }
  },

  toggleMusic: () => {
    const { music, currentMusicTrack, isMuted } = get();
    if (isMuted) return;

    const currentSound = music[currentMusicTrack];

    if (!currentSound.sound) {
      currentSound.sound = new Howl({
        src: [currentSound.url],
        volume: currentSound.volume,
        loop: currentSound.loop,
      });
    }

    if (currentSound.sound.playing()) {
      currentSound.sound.pause();
      set({ isMusicPlaying: false });
    } else {
      currentSound.sound.play();
      set({ isMusicPlaying: true });
    }
  },

  toggleEnvironmentalSounds: () => {
    const {
      isEnvironmentalSoundPlaying,
      playEnvironmentalSound,
      stopEnvironmentalSound,
      adjustEnvironmentalSoundVolumes,
      isMuted,
    } = get();
    if (isMuted) return;

    if (isEnvironmentalSoundPlaying) {
      stopEnvironmentalSound();
      set({ isEnvironmentalSoundPlaying: false });
    } else {
      playEnvironmentalSound('cityAmbiance');
      playEnvironmentalSound('natureAmbiance');
      set({ isEnvironmentalSoundPlaying: true });

      // Determine the current route
      const path = window.location.pathname;
      const isEssRoute = path.startsWith('/ess');
      const currentGridStore = isEssRoute ? useEssGridStore : useMainGridStore;
      const urbanRatio = currentGridStore.getState().calculateUrbanRatio();
      adjustEnvironmentalSoundVolumes(urbanRatio);
    }
  },

  playEnvironmentalSound: (id) => {
    const { environmentalSounds, isMuted } = get();
    if (isMuted) return;

    const soundConfig = environmentalSounds[id];
    if (soundConfig) {
      if (!soundConfig.sound) {
        soundConfig.sound = new Howl({
          src: [soundConfig.url],
          volume: soundConfig.volume,
          loop: true,
        });
      }
      soundConfig.sound.play();
    }
  },

  stopEnvironmentalSound: () => {
    const { environmentalSounds } = get();
    Object.values(environmentalSounds).forEach((soundConfig) => {
      if (soundConfig && soundConfig.sound) {
        soundConfig.sound.stop();
      }
    });
    set({ isEnvironmentalSoundPlaying: false });
  },

  adjustEnvironmentalSoundVolumes: (urbanRatio) => {
    const { environmentalSounds, isMuted } = get();
    if (isMuted) return;

    const MAX_CITY_VOLUME = 0.28; // Reduced by 30%
    const MAX_NATURE_VOLUME = 0.1; // Reduced by 30%
    const MIN_NATURE_VOLUME = 0.01; // Reduced by 30%

    let cityVolume = Math.min(
      MAX_CITY_VOLUME,
      Math.pow(urbanRatio, 0.5) * MAX_CITY_VOLUME
    );
    let natureVolume = Math.max(
      MIN_NATURE_VOLUME,
      MAX_NATURE_VOLUME -
        Math.pow(urbanRatio, 0.9) * (MAX_NATURE_VOLUME - MIN_NATURE_VOLUME)
    );

    if (environmentalSounds.cityAmbiance.sound) {
      environmentalSounds.cityAmbiance.sound.volume(cityVolume);
    }
    if (environmentalSounds.natureAmbiance.sound) {
      environmentalSounds.natureAmbiance.sound.volume(natureVolume);
    }

    set({
      environmentalSounds: {
        ...environmentalSounds,
        cityAmbiance: {
          ...environmentalSounds.cityAmbiance,
          volume: cityVolume,
        },
        natureAmbiance: {
          ...environmentalSounds.natureAmbiance,
          volume: natureVolume,
        },
      },
    });
  },

  resetSounds: () => {
    const {
      adjustEnvironmentalSoundVolumes,
      toggleMusic,
      stopEnvironmentalSound,
      toggleEnvironmentalSounds,
      music,
      currentMusicTrack,
      isMuted,
    } = get();

    if (isMuted) return;

    stopEnvironmentalSound();
    if (music[currentMusicTrack].sound) {
      music[currentMusicTrack].sound.stop();
    }

    toggleMusic();
    toggleEnvironmentalSounds();

    // Determine the current route
    const path = window.location.pathname;
    const isEssRoute = path.startsWith('/ess');
    const currentGridStore = isEssRoute ? useEssGridStore : useMainGridStore;
    const urbanRatio = currentGridStore.getState().calculateUrbanRatio();

    adjustEnvironmentalSoundVolumes(urbanRatio);

    set({
      isEnvironmentalSoundPlaying: true,
      isMusicPlaying: true,
    });
  },
}));

export default useAudioStore;
