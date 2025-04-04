import { useSpring, animated } from "react-spring";
import { useEffect, useRef } from "react";
import RoundedButton from "../ui/RoundedButton";
import useGridStore from "@src/stores/gridStore";
import useAudioStore from "@src/stores/audioStore";
import '@src/styles/ResetModal.css';

const ResetModal = ({ onClose }) => {
	const { setScreen } = useGridStore();
	const { playSound } = useAudioStore();
	const modalRef = useRef(null);
	const firstButtonRef = useRef(null);
	const lastButtonRef = useRef(null);

	useEffect(() => {
		// Focus the first button when modal opens
		if (firstButtonRef.current) {
			firstButtonRef.current.focus();
		}

		// Handler for trapping focus
		const handleTabKey = (e) => {
			if (e.key === 'Tab') {
				if (e.shiftKey) {
					// If shift + tab and first button is focused, move to last button
					if (document.activeElement === firstButtonRef.current) {
						e.preventDefault();
						lastButtonRef.current?.focus();
					}
				} else {
					// If tab and last button is focused, move to first button
					if (document.activeElement === lastButtonRef.current) {
						e.preventDefault();
						firstButtonRef.current?.focus();
					}
				}
			}
		};

		// Add event listener
		modalRef.current?.addEventListener('keydown', handleTabKey);

		return () => {
			// Clean up event listener
			modalRef.current?.removeEventListener('keydown', handleTabKey);
		};
	}, []);

	const resetGame = () => {
		playSound("resetSound");
		setScreen('start');
	};

	const modalAnimation = useSpring({
		from: { opacity: 0, transform: 'scale(0.9)' },
		to: { opacity: 1, transform: 'scale(1)' },
		config: { tension: 300, friction: 20 }
	});

	return (
		<div className="modal-wrapper reset-modal aag-reset-modal">
			<animated.div
				className="modal"
				style={modalAnimation}
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				tabIndex="-1"
			>
				<div className="modal-header">
					<h2 id="modal-title">START OVER?</h2>
				</div>

				<div className="modal-content">
					Want to head to the start screen to review the instructions?
				</div>

				<footer className="modal-footer">
					<RoundedButton
						ref={firstButtonRef}
						text="Go to Home Screen"
						color="#4a6537"
						size={"large"}
						onClick={resetGame}
					/>
					<RoundedButton
						ref={lastButtonRef}
						text="No, I’ll Stay Here"
						color="#78AAA1"
						size={"large"}
						onClick={onClose}
					/>
				</footer>
			</animated.div>
		</div>
	);
};

export default ResetModal;