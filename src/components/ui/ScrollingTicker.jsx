import React, { useEffect, useState, useRef } from 'react';
import useResourcesStore from '../../stores/resourcesStore';
import '../../styles/ScrollingTicker.css';

const ScrollingTicker = () => {
    const [messages, setMessages] = useState([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [showTicker, setShowTicker] = useState(true);
    const [animationDuration, setAnimationDuration] = useState(0);
    const tickerTextRef = useRef(null);

    const notifications = useResourcesStore((state) => state.notifications);

    // Update messages when notifications change
    useEffect(() => {
        if (notifications.length > 0) {
            setMessages(notifications);
            setCurrentMessageIndex(0);
            setShowTicker(true);
        }
    }, [notifications]);

    // Hotkey listener
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key.toLowerCase() === 't') {
                setShowTicker((prevShowTicker) => !prevShowTicker);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Measure the width of the text and calculate animation duration
    useEffect(() => {
        if (tickerTextRef.current) {
            const textWidth = tickerTextRef.current.getBoundingClientRect().width;
            const containerWidth = tickerTextRef.current.parentElement.getBoundingClientRect().width;
            const totalDistance = textWidth + containerWidth; // Distance the text needs to travel
            const speed = 100; // Pixels per second (adjust as needed)

            const duration = totalDistance / speed; // Duration in seconds
            setAnimationDuration(duration);
        }
    }, [messages, currentMessageIndex]);

    if (!showTicker || messages.length === 0) {
        return null; // Don't render anything if there are no messages or ticker is hidden
    }

    const currentMessage = messages[currentMessageIndex];

    // Handle animation end
    const handleAnimationEnd = () => {
        if (currentMessageIndex < messages.length - 1) {
            setCurrentMessageIndex((prevIndex) => prevIndex + 1);
        } else {
            // Hide the ticker after all messages have scrolled
            setShowTicker(false);
        }
    };

    return (
        <div className="ticker-container">
            <div
                className="ticker-text"
                style={{ animationDuration: `${animationDuration}s` }}
                onAnimationEnd={handleAnimationEnd}
                ref={tickerTextRef}
            >
                {currentMessage}
            </div>
        </div>
    );
};

export default ScrollingTicker;