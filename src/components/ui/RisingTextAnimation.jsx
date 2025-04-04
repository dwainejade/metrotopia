import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const RisingTextAnimation = ({ position, textContent, color = 'greenyellow', onAnimationComplete }) => {
    const textRef = useRef();
    const elapsedRef = useRef(0);
    const adjustedPosition = [position[0], position[1], position[2] - .2];
    const duration = 3.5; // Animation duration in seconds
    const riseHeight = 0.4; // How high the text should rise

    useFrame((state, delta) => {
        if (textRef.current) {
            elapsedRef.current += delta;

            // Calculate progress
            const progress = Math.min(elapsedRef.current / duration, 1);

            // Update text position and opacity
            textRef.current.position.z = adjustedPosition[2] - riseHeight * progress;
            textRef.current.material.opacity = 1 - progress;

            // Call the completion callback when the animation is done
            if (elapsedRef.current >= duration) {
                onAnimationComplete();
            }
        }
    });

    return (
        <Text
            ref={textRef}
            position={adjustedPosition}
            fontSize={.08}
            color={color}
            anchorX="center"
            anchorY="middle"
            material-toneMapped={false}
            rotation={[-Math.PI / 2, 0, 0]}
        >
            {textContent}
        </Text>
    );
};

export default RisingTextAnimation;