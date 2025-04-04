import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import useAudioStore from '../stores/audioStore';

const AudioPlayer = () => {
    const audioRefs = useRef({});
    const { audioSources } = useAudioStore();

    if (!audioSources) return null;

    const createHowl = (id, source) => {
        return new Howl({
            src: [source.url],
            loop: source.loop,
            volume: source.volume,
            html5: true, // This can help with mobile playback and streaming larger files
            onloaderror: (soundId, error) => {
                console.error(`Failed to load audio for ${id}:`, error);
            },
            onplayerror: (soundId, error) => {
                console.error(`Failed to play audio for ${id}:`, error);
            },
        });
    };

    useEffect(() => {
        // Initialize Howl instances
        Object.entries(audioSources).forEach(([id, source]) => {
            if (!audioRefs.current[id]) {
                const howl = createHowl(id, source);
                audioRefs.current[id] = howl;
            }
        });

        // Cleanup function
        return () => {
            Object.values(audioRefs.current).forEach(howl => {
                howl.unload();
            });
        };
    }, [audioSources]);

    useEffect(() => {
        Object.entries(audioSources).forEach(([id, source]) => {
            const howl = audioRefs.current[id];
            if (howl) {
                howl.volume(source.volume);
                if (source.isPlaying) {
                    howl.play();
                } else {
                    howl.pause();
                }
            }
        });
    }, [audioSources]);

    return null; // This component doesn't render anything
};

export default AudioPlayer;