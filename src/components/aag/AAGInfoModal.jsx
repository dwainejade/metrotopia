import React, { useRef, useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import "@src/styles/BuildingInfoMenu.css";
import RoundedButton from "../ui/RoundedButton";
import useGridStore from "@src/stores/gridStore";
import TileDescription, {
    locationDescriptions,
    tileDescriptionMap,
    naturalFeatures
} from "./TileDescription";

const buildingTypes = {
    singleFamilyHomes: "residential-info",
    apartmentComplex: "residential-info",
    factory: "industrial-info",
    warehouse: "industrial-info",
    governmentBuilding: "services-info",
    hospital: "services-info",
    hotels: "commercial-info",
    mediumOfficeBuildings: "commercial-info",
    retailCenter: "commercial-info",
    tallOfficeBuilding: "commercial-info",
    // Natural features
    sparseTreesArea: "nature-info",
    someTreesArea: "nature-info",
    thickForestedArea: "nature-info",
    meadow: "nature-info",
    pond: "nature-info",
    windingStream_vertical: "nature-info",
    windingStream_horizontal: "nature-info"
};

const buildingTypeColors = {
    "residential-info": "#4a6537",
    "commercial-info": "#779de0",
    "services-info": "#c78e67",
    "industrial-info": "#8d5999",
    "nature-info": "#2e8b57" // Green for nature features
};

const BuildingInfoMenu = ({ onCancel }) => {
    const {
        tiles,
        selectedTile,
        usingKeyboard
    } = useGridStore();
    const selectedTileData = selectedTile ? tiles[selectedTile] : null;
    const tileType = selectedTileData ? selectedTileData.type : null;
    const menuRef = useRef(null);
    const [tileTitle, setTileTitle] = useState("");
    const [locationInfo, setLocationInfo] = useState({ title: "", description: "" });

    // Get the title for the selected tile and location information
    useEffect(() => {
        if (tileType && selectedTile) {
            let title = "";
            let location = "";

            // First check if this tile has a direct mapping in our tileDescriptionMap
            if (tileDescriptionMap[selectedTile]) {
                title = tileDescriptionMap[selectedTile].title;
                location = tileDescriptionMap[selectedTile].location;
            }
            // For natural features, get title from the nature section
            else if (naturalFeatures.includes(tileType) ||
                (tileType === 'windingStream_vertical' || tileType === 'windingStream_horizontal')) {
                const baseType = (tileType === 'windingStream_vertical' || tileType === 'windingStream_horizontal')
                    ? 'windingStream'
                    : tileType;
                const natureInfo = locationDescriptions.nature[baseType];
                if (natureInfo) {
                    title = natureInfo.title;
                    location = 'nature';
                }
            }

            // If we couldn't find a title, use a default one
            if (!title) {
                const baseType = tileType;
                title = baseType
                    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
                    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
            }

            setTileTitle(title);

            // Set location information
            if (location && locationDescriptions[location]) {
                setLocationInfo({
                    title: locationDescriptions[location].title,
                    description: locationDescriptions[location].description
                });
            } else {
                setLocationInfo({ title: "", description: "" });
            }
        }
    }, [tileType, selectedTile]);

    // useEffect(() => {
    //     if (usingKeyboard && menuRef.current) {
    //         menuRef.current.focus();
    //     }
    // }, [usingKeyboard, selectedTile]);

    if (!selectedTileData || !selectedTileData.metrics) return null;

    const handleKeyDown = (e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
            onCancel();
        }
    };

    // Animation for the menu appearance
    const menuAnimation = useSpring({
        from: { opacity: 0, transform: "translateX(-80px)" },
        to: { opacity: 1, transform: "translateX(0px)" },
        config: { tension: 300, friction: 20 },
    });

    // Get the appropriate CSS class for styling
    const menuClass = buildingTypes[tileType] || 'default-info';
    const buttonColor = buildingTypeColors[menuClass] || "#4a6537";

    return (
        <animated.div
            className={`upgrade-menu ${menuClass} aag-info-modal`}
            style={menuAnimation}
            ref={menuRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="header-wrapper">
                <div className="header">
                    <div className={`building-icon ${menuClass}`}>
                    </div>
                    <div className="title-wrapper">
                        <h3 className="title">{tileTitle}</h3>
                    </div>
                </div>
            </div>
            <div className="content">
                {/* Display the location area description */}
                {locationInfo.title && locationInfo.description && (
                    <div className="location-info" style={{ margin: "2%", fontSize: "1.05rem" }}>
                        <h4 className="location-title">{locationInfo.title}:
                            <span style={{ fontWeight: "normal" }}> {locationInfo.description}</span>
                        </h4>
                    </div>
                )}
                <div className="details-wrapper ee">
                    {/* Modified TileDescription to skip the title since we're showing it in the header */}
                    <TileDescription
                        buildingType={tileType}
                        tileKey={selectedTile}
                        hideTitle={true} // Add a prop to hide the title
                    />
                </div>
            </div>

            <div className={`footer ee`}>
                <RoundedButton
                    text="Close"
                    color={buttonColor}
                    size={"small"}
                    onClick={onCancel}
                />
            </div>
        </animated.div>
    );
};

export default BuildingInfoMenu;