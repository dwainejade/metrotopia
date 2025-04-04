import { useState, useRef, useEffect } from 'react';
import useAudioStore from '../../stores/audioStore';
import useVersionStore from '../../stores/versionStore';
import { useSpring, animated, useTransition } from 'react-spring';
import RoundedButton from './RoundedButton';
import { instructionSets } from './instructionSets';
import '../../styles/InstructionsModal.css';

const InstructionsModal = ({ onClose }) => {
  const { current: version } = useVersionStore();
  const [currentPage, setCurrentPage] = useState(0);
  const { playSound } = useAudioStore();
  const modalRef = useRef(null);
  const prevButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  const instructionPages = instructionSets[version];

  useEffect(() => {
    // Focus the close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        const activeButtons = [
          currentPage !== 0 && prevButtonRef.current,
          closeButtonRef.current,
          currentPage !== instructionPages.length - 1 && nextButtonRef.current,
        ].filter(Boolean);

        const firstActiveButton = activeButtons[0];
        const lastActiveButton = activeButtons[activeButtons.length - 1];

        if (e.shiftKey) {
          // If shift + tab and first active button is focused, move to last active button
          if (document.activeElement === firstActiveButton) {
            e.preventDefault();
            lastActiveButton?.focus();
          }
        } else {
          // If tab and last active button is focused, move to first active button
          if (document.activeElement === lastActiveButton) {
            e.preventDefault();
            firstActiveButton?.focus();
          }
        }
      }
    };

    modalRef.current?.addEventListener('keydown', handleTabKey);
    return () => {
      modalRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [currentPage, instructionPages.length]);

  const handleNextPage = () => {
    playSound('menuClickSound');
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, instructionPages.length - 1)
    );
  };

  const handlePreviousPage = () => {
    playSound('menuClickSound');
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const modalAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 300, friction: 20 },
  });

  const transitions = useTransition(currentPage, {
    from: { opacity: 0, transform: 'translate(15px,0)' },
    enter: { opacity: 1, transform: 'translate(0,0)' },
    leave: { opacity: 0, transform: 'translate(-15px,0)' },
    config: { tension: 300, friction: 30 },
    immediate: false,
    reset: true,
  });

  return (
    <div className="modal-wrapper instructions-modal">
      <animated.div
        className="modal"
        style={modalAnimation}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-title"
        tabIndex="-1"
      >
        <div className="modal-header">
          {transitions((style, i) => (
            <h2 id="instructions-title">{instructionPages[i].title}</h2>
          ))}
        </div>

        <div className="modal-content">
          {transitions((style, index) => (
            <animated.div style={style} className="modal-page">
              {instructionPages[index].content}
            </animated.div>
          ))}
        </div>

        <footer className="modal-footer">
          <button
            ref={prevButtonRef}
            className="nav-btn prev"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            aria-label="Go to previous page"
          />
          <RoundedButton
            ref={closeButtonRef}
            text="Close"
            color="#4a6536"
            size={'medium'}
            onClick={onClose}
          />
          <button
            ref={nextButtonRef}
            className="nav-btn next"
            onClick={handleNextPage}
            disabled={currentPage === instructionPages.length - 1}
            aria-label="Go to next page"
          />
        </footer>
      </animated.div>
    </div>
  );
};

export default InstructionsModal;