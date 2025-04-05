import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import useCameraStore from '@src/stores/cameraStore';

const AutoPanCamera = ({ isStartScreen }) => {
    const { camera } = useThree();
    const {
        setCamera,
        startAutoPan,
        stopAutoPan,
        updateAutoPan,
        updateZoom,
        setPanLimits,
    } = useCameraStore();

    const frameCountRef = useRef(0);
    const autoPanRef = useRef(useCameraStore.getState().getAutoPanRef());
    const isInitializedRef = useRef(false);

    // Initialize camera and set up auto pan
    useEffect(() => {
        if (camera && !isInitializedRef.current) {
            setCamera(camera);
            setPanLimits();
            isInitializedRef.current = true;

            // Start auto pan if we're on the start screen
            if (isStartScreen) {
                // Small delay to ensure everything is set up
                setTimeout(() => {
                    startAutoPan();
                }, 100);
            }
        }
    }, [camera, isStartScreen, setCamera, setPanLimits, startAutoPan]);

    // Handle screen mode changes
    useEffect(() => {
        if (isStartScreen) {
            startAutoPan();
        } else {
            stopAutoPan();
        }
    }, [isStartScreen, startAutoPan, stopAutoPan]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isStartScreen) {
                if (event.key === '1' && !autoPanRef.current.isActive) {
                    startAutoPan();
                } else {
                    stopAutoPan();
                }
            }
        };

        const handleMouseClick = () => {
            if (!isStartScreen && autoPanRef.current.isActive) {
                stopAutoPan();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleMouseClick);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleMouseClick);
            stopAutoPan();
        };
    }, [isStartScreen, startAutoPan, stopAutoPan]);

    useFrame(() => {
        if (autoPanRef.current.isActive) {
            try {
                updateAutoPan();
                updateZoom();

                frameCountRef.current += 1;
                if (frameCountRef.current % 60 === 0) {
                    frameCountRef.current = 0;
                }
            } catch (error) {
                console.error('Error in autopan update:', error);
                stopAutoPan();
            }
        }
    });

    return null;
};

export default AutoPanCamera;