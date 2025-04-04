import AnimatedValue from "../../helpers/AnimatedValue";

const LandscapeDetails = ({ trees, temperature }) => {
    return (
        <div className="bottom-categories nature">
            <div className="top-category-details">
                <p>
                    <span className="category-label">Total Land: </span>
                    10,000,000 ft.<sup>2</sup>
                </p>
                <p>
                    <span className="category-label">Land per Parcel: </span>
                    100,000 ft.<sup>2</sup>
                </p>
                <p>
                    <span className="category-label">Total Parcels: </span>
                    100
                </p>
            </div>

            <div className="bottom-checklist nature">
                <div className="nature-stats">
                    <p>
                        <span className="bottom-label">Average Temp at the Start</span>
                        <span>
                            <AnimatedValue value={temperature?.starting || 0} precision={2} />
                            °F
                        </span>
                    </p>
                    <p>
                        <span className="bottom-label">Current Average Temp</span>
                        <span>
                            <AnimatedValue value={temperature?.current || 0} precision={2} />
                            °F
                        </span>
                    </p>

                    <p>
                        <span className="bottom-label">
                            Heat Island Effect at the Start
                        </span>{' '}
                        <span>
                            0 °F
                        </span>
                    </p>
                    <p>
                        <span className="bottom-label">Current Heat Island Effect</span>{' '}
                        <span>
                            {temperature.current - temperature.starting > 0 ? '+' : ''}
                            <AnimatedValue value={temperature.current - temperature.starting || 0} precision={2} />
                            °F
                        </span>
                    </p>
                </div>

                <p className="nature-tree-preserve">
                    <span className="category-label">
                        Percentage of Trees Preserved:{' '}
                    </span>
                    <span>
                        <AnimatedValue value={trees?.percentPreserved || 0} precision={1} />
                        %
                    </span>
                </p>

                <div className="nature-stats">
                    <p>
                        <span className="bottom-label">Starting Number of Trees</span>{' '}
                        <span>
                            <AnimatedValue value={trees?.startingTrees || 0} type="stat" />
                        </span>
                    </p>

                    <p>
                        <span className="bottom-label">Current Number of Trees</span>{' '}
                        <AnimatedValue value={trees?.currentTrees || 0} type="stat" />
                    </p>
                    <p>
                        <span className="bottom-label">Trees Lost Due to Development</span>{' '}
                        <AnimatedValue value={trees?.treesLost || 0} type="stat" />
                    </p>
                    <p>
                        <span className="bottom-label">Trees Added from Green Mods</span>{' '}
                        <AnimatedValue value={trees?.fromGreenMods || 0} type="stat" />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LandscapeDetails