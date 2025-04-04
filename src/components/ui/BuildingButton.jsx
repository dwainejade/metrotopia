import React from 'react';
import Tippy from '@tippyjs/react';
import useGridStore from '../../stores/gridStore';
import gameObjects from '../../data/gameObjects';
import useTextureStore from '../../stores/textureStore';

const BuildingButton = ({ structureId, selectedStructure, handleClick }) => {
    const { urbanStructures } = gameObjects;
    const { selectedTile, canBuild } = useGridStore();
    const { preloadedUIImages } = useTextureStore();

    const activeStructure = selectedStructure === structureId;
    const structure = urbanStructures[structureId];

    // Check if the structure can be built on the selected tile
    const buildability = selectedTile
        ? canBuild(selectedTile, structureId)
        : { canBuild: false, reasons: ['No tile selected'] };
    const isDisabled = !buildability.canBuild;

    if (!structure) {
        return null; // Or return some fallback UI
    }

    const getBuildingImage = () => {
        return preloadedUIImages[structureId] || '';
    };

    const tooltipContent = isDisabled
        ? buildability.reasons.join('\n')
        : null;

    const buttonContent = (
        <div className={`btn-wrapper ${isDisabled ? 'disabled' : ''}`}>
            <button
                className={`building-btn tile-type ${activeStructure ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={!isDisabled ? handleClick : null}
            >
                <div className="content-wrapper">
                    {preloadedUIImages && (
                        <img
                            src={getBuildingImage().src}
                            alt={structure.name}
                            className="building-img"
                        />
                    )}
                    <div className="info">
                        <p className="building-name">{structure.name}</p>
                        <p className="cost">{'$' + structure.metrics.cost.toLocaleString()}</p>
                    </div>
                </div>
            </button>
        </div>
    );

    return tooltipContent ? (
        <Tippy content={tooltipContent} animation="shift-away-subtle">
            {buttonContent}
        </Tippy>
    ) : buttonContent;
};

export default BuildingButton;