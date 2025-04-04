import React from 'react';
import AnimatedValue from '../../../helpers/AnimatedValue';

const WildlifeDetails = ({ wildlife }) => {
    return (
        <div className="bottom-categories wildlife-stats">
            <div className="top-category-details">
                <p>
                    <span className="category-label">Current Wildlife Population: </span>
                    <AnimatedValue
                        value={Math.max(0, wildlife.currentWildlife || 0)}
                        type="stat"
                    />{' '} animals
                </p>
                <p>
                    <span className="category-label">Starting Wildlife Population: </span>
                    <AnimatedValue
                        value={Math.max(0, wildlife.startingWildlife || 0)}
                        type="stat"
                    />{' '} animals
                </p>
                <p>
                    <span className="category-label">
                        Percentage of Wildlife Preserved:
                    </span>{' '}
                    <AnimatedValue value={wildlife.percentPreserved || 0} precision={1} />
                    %
                </p>
            </div>
            <div className="bottom-checklist wildlife">
                <p> Large Mammals:
                    <span>
                        <span className="wildlife-stat-count">
                            {(wildlife?.currentLargeMammals).toLocaleString()}/{(wildlife?.startingLargeMammals).toLocaleString()}
                        </span>
                        <span className='wildlife-stat-percent'>
                            (<AnimatedValue
                                value={Math.max(
                                    0,
                                    (wildlife?.currentLargeMammals /
                                        wildlife?.startingLargeMammals) *
                                    100 || 0
                                )}
                                precision={1}
                            />
                            %)
                        </span>
                    </span>
                </p>
                <p> Small Mammals:
                    <span>
                        <span className="wildlife-stat-count">
                            {(wildlife?.currentSmallMammals).toLocaleString()}/{(wildlife?.startingSmallMammals).toLocaleString()}
                        </span>
                        <span className='wildlife-stat-percent'>
                            (<AnimatedValue
                                value={Math.max(
                                    0,
                                    (wildlife?.currentSmallMammals /
                                        wildlife?.startingSmallMammals) *
                                    100 || 0
                                )}
                                precision={1}
                            />
                            %)
                        </span>
                    </span>
                </p>
                <p> Reptiles and Amphibians:
                    <span>
                        <span className="wildlife-stat-count">
                            {(wildlife?.currentReptilesAndAmphibians).toLocaleString()}/{(wildlife?.startingReptilesAndAmphibians).toLocaleString()}
                        </span>
                        <span className='wildlife-stat-percent'>
                            (<AnimatedValue
                                value={Math.max(
                                    0,
                                    (wildlife?.currentReptilesAndAmphibians /
                                        wildlife?.startingReptilesAndAmphibians) *
                                    100 || 0
                                )}
                                precision={1}
                            />
                            %)
                        </span>
                    </span>
                </p>
                <p> Birds:
                    <span>
                        <span className="wildlife-stat-count">
                            {(wildlife?.currentBirds).toLocaleString()}/{(wildlife?.startingBirds).toLocaleString()}
                        </span>
                        <span className='wildlife-stat-percent'>
                            (<AnimatedValue
                                value={Math.max(
                                    0,
                                    (wildlife?.currentBirds / wildlife?.startingBirds) * 100 || 0
                                )}
                                precision={1}
                            />
                            %)
                        </span>
                    </span>
                </p>
                <p> Fish:
                    <span>
                        <span className="wildlife-stat-count">
                            {(wildlife?.currentFish).toLocaleString()}/{(wildlife?.startingFish).toLocaleString()}
                        </span>
                        <span className='wildlife-stat-percent'>
                            (<AnimatedValue
                                value={Math.max(
                                    0,
                                    (wildlife?.currentFish / wildlife?.startingFish) * 100 || 0
                                )}
                                precision={1}
                            />
                            %)
                        </span>
                    </span>
                </p>
            </div>
        </div>
    );
};

export default WildlifeDetails;