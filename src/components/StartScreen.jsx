import React, { useState, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';
import '../styles/StartScreen.css';
import RoundedButton from './ui/RoundedButton';
import useTextureStore from '../stores/textureStore';
import useAudioStore from '../stores/audioStore';
import useVersion from '../stores/versionStore';
import useBuildData from '../data/useBuildData';

const StartScreen = ({ onStart }) => {
  const { current: version } = useVersion();
  const { preloadedUIImages } = useTextureStore();
  const { playSound } = useAudioStore();
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const buildData = useBuildData();

  const data = buildData[version];
  useEffect(() => {
    const timer = setTimeout(() => {}, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Title animation
  const titleSpring = useSpring({
    from: {
      transform: 'translateY(0px)',
      scale: 1.1,
    },
    to: {
      transform: 'translateY(-50%)',
      scale: 1,
    },
    delay: 800,
    config: config.stiff,
    onRest: () => {
      setDescriptionVisible(true);
    },
  });

  // Content animation
  const descriptionSpring = useSpring({
    opacity: descriptionVisible ? 1 : 0,
    transform: descriptionVisible ? 'translateY(0)' : 'translateY(-50px)',
    config: config.stiff,
  });

  const handleStart = () => {
    playSound('powerModSound');
    onStart();
  };

  return (
    <div className={`start-screen ${version}`}>
      <div className="start-screen-content">
        <animated.div className="title-con" style={titleSpring}>
          {version === 'main' && (
            <img src={preloadedUIImages.title.src} alt={data.title} />
          )}
          {version === 'ess' && (
            <img src={preloadedUIImages.title_ess.src} alt={data.title} />
          )}
          {version === 'pp' && (
            <img src={preloadedUIImages.title_pp.src} alt={data.title} />
          )}
          {version === 'lwl' && (
            <img src={preloadedUIImages.title_lwl.src} alt={data.title} />
          )}
          {version === 'aag' && (
            <img src={preloadedUIImages.title_aag.src} alt={data.title} />
          )}
          {version === 'ee' && (
            <img src={preloadedUIImages.title_ee.src} alt={data.title} />
          )}
        </animated.div>

        <animated.div style={descriptionSpring} className="description-con">
          {/* split the description into paragraphs */}
          {data.description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph.trim()}</p>
          ))}

          <footer>
            <RoundedButton
              text="START"
              color="#4a6537"
              size={'large'}
              onClick={handleStart}
            />
          </footer>
        </animated.div>
      </div>
    </div>
  );
};

export default StartScreen;
