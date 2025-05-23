import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UI from '@src/components/ui/UI';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Stats } from '@react-three/drei';
import Scene from '@src/components/Scene';
import AutoPanCamera from '@src/helpers/AutoPanCamera';

import useVersionStore, { APP_VERSIONS } from '@src/stores/versionStore';
import useGridStore from '@src/stores/gridStore';
import useTransitionStore from '@src/stores/transitionStore';
import useMeasure from 'react-use-measure';
import StartScreen from '@src/components/StartScreen';
import LoadingScreen from '@src/components/LoadingScreen';
import GridTransition from '@src/components/ui/GridTransition';
import { Head } from 'vite-react-ssg';

const getLastPathSegment = (path) => {
  if (!path) return '';
  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
  return cleanPath.split('/').pop() || '';
};

const PP = () => {
  const {
    startGame,
    screen,
    devMode,
    pauseCarMovement,
    resumeCarMovement,
    setSelectedTile,
  } = useGridStore();
  const {
    startTransition,
    endTransition,
    isTransitioning,
    direction,
    setDirection,
  } = useTransitionStore();
  const { current, title, setVersion } = useVersionStore();
  const location = useLocation();

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [ref, bounds] = useMeasure();
  const ratio = bounds.height / bounds.width;
  const frustum = 800;
  const horizonal = ratio < 1 ? frustum / ratio : frustum;
  const vertical = ratio < 1 ? frustum : frustum * ratio;

  // Update version store when location changes
  useEffect(() => {
    const lastSegment = getLastPathSegment(location.pathname);

    // Find matching version that includes the current path
    const matchedVersion =
      Object.values(APP_VERSIONS).find((version) =>
        version.paths.includes(lastSegment)
      ) || APP_VERSIONS.main;

    // Update the store only if the version has changed
    if (current !== matchedVersion.id) {
      setVersion(matchedVersion.id, matchedVersion.title, lastSegment);
    }
  }, [location.pathname, current, setVersion]);

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseCarMovement();
      } else {
        resumeCarMovement();
      }
    });

    if (loadingComplete) {
      resumeCarMovement();
    }

    return () => {
      document.removeEventListener('visibilitychange', () => { });
    };
  }, [loadingComplete, pauseCarMovement, resumeCarMovement]);

  useEffect(() => {
    setSelectedTile(null);
  }, [setSelectedTile]);

  const handleStart = () => {
    setDirection('forward');
    startTransition();
  };

  const handleTransitionComplete = () => {
    if (direction === 'forward') {
      // Start the game after forward animation completes
      setDirection('reverse');
      setCanvasKey((prev) => prev + 1);
      startGame();
    } else if (direction === 'reverse') {
      endTransition();
    }
  };

  return (
    <div className="Main power-policy" ref={ref}>
      <Head>
        <title>{title}</title>
      </Head>

      {!loadingComplete && (
        <LoadingScreen onLoaded={() => setLoadingComplete(true)} />
      )}

      {/* Trigger the grid transition based on transition state */}
      {isTransitioning && (
        <GridTransition
          direction={direction}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Show StartScreen if game is not started yet */}
      {loadingComplete && screen === 'start' && !isTransitioning && (
        <StartScreen onStart={handleStart} buildType={'pp'} />
      )}

      {/* Render game UI when screen is 'game' */}
      {loadingComplete && screen === 'game' && !isTransitioning && (
        <UI />
      )}

      {/* Render the 3D Canvas */}
      {loadingComplete && (
        <Canvas id="canvas" ref={ref} dpr={[1, 2]} flat key={canvasKey}>
          <OrthographicCamera
            makeDefault
            zoom={300}
            position={[0, 500, 0]}
            top={vertical}
            bottom={-vertical}
            left={-horizonal}
            right={horizonal}
            rotation={[-Math.PI / 2, 0, 0]}
            manual
            near={0.01}
            far={10000}
          />
          <AutoPanCamera isStartScreen={screen === 'start'} />

          <Scene />
          {devMode && <Stats className="stats" />}
        </Canvas>
      )}
    </div>
  );
};

export default PP;
