import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpriteMaterial, MathUtils } from 'three';
import useTextureStore from '../../stores/textureStore';

const iconMap = {
    satisfaction: 'smileyFace',
    pollutionDecrease: 'air',
};

const getScale = (feedbackType) => {
    switch (feedbackType) {
        case 'satisfaction':
            return 0.1;
        case 'pollutionDecrease':
            return 0.1;
        case 'treesAdded':
            return 0.1;
        default:
            return 0.2;
    }
};

const RisingFeedbackAnimation = ({ position, feedbackType, onAnimationComplete }) => {
    const { preloadedTextures } = useTextureStore();

    const spriteRef = useRef();
    const elapsedRef = useRef(0);
    const adjustedPosition = [position[0], position[1], position[2] - 0.2];
    const riseDuration = 1.2; // Duration for rising animation
    const holdDuration = .6; // Duration to hold at the top
    const fadeDuration = .2; // Duration for fading out
    const totalDuration = riseDuration + holdDuration + fadeDuration;
    const riseHeight = 0.25; // How high the sprite should rise

    const texture = preloadedTextures[iconMap[feedbackType]] || preloadedTextures[iconMap.satisfaction];

    // Memoize the material to avoid recreating it on every render
    const material = useMemo(() => new SpriteMaterial({ map: texture }), [texture]);

    useEffect(() => {
        return () => material.dispose();
    }, [material]);

    useFrame((state, delta) => {
        if (spriteRef.current) {
            elapsedRef.current += delta;

            // Calculate progress for each phase
            const riseProgress = Math.min(elapsedRef.current / riseDuration, 1);
            const fadeProgress = Math.max(0, Math.min((elapsedRef.current - (riseDuration + holdDuration)) / fadeDuration, 1));

            // Use easing function for smoother animation
            const easedRiseProgress = easeOutCubic(riseProgress);

            // Lerp the sprite position
            const newZ = MathUtils.lerp(
                adjustedPosition[2],
                adjustedPosition[2] - riseHeight,
                easedRiseProgress
            );
            spriteRef.current.position.z = newZ;

            // Set opacity based on fade progress
            spriteRef.current.material.opacity = 1 - fadeProgress;

            // Call the completion callback when the animation is done
            if (elapsedRef.current >= totalDuration) {
                onAnimationComplete();
            }
        }
    });

    return (
        <sprite
            ref={spriteRef}
            position={adjustedPosition}
            scale={getScale(feedbackType)}
            material={material}
        />
    );
};

// Easing function for smoother animation
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

export default RisingFeedbackAnimation;