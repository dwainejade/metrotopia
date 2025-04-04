import React from 'react';

// Structured organization of tile descriptions by location with explicit tile mappings
export const locationDescriptions = {
  // Beachside Waterfront (Column A)
  beachSideWaterfront: {
    title: "Beachside",
    description: "These are buildings next to the ocean, right along the coastline.",
    apartmentComplex: {
      title: "Apartments",
      description: "Apartments by the ocean offer residents stunning oceanside views. The beach becomes their backyard, perfect for both fun-filled and relaxing days in between their usual daily routines. Things may get busy though when summer rolls by and the peak season for vacation brings boatloads of tourists.",
      tiles: ['0-0', '0-1', '0-3', '0-4', '0-7', '0-9']
    },
    hotels: {
      title: "Hotel",
      description: "A hotel right next to the water offers tourists the best of both worlds. Cool and relaxing rooms inside and the sunny beach outside. This prime location may mean higher prices for booking.",
      tiles: ['0-6', '0-8']
    },
    tallOfficeBuilding: {
      title: "Tall Office Building",
      description: "The perfect mix of work and play. This office building provides an inspirational backdrop to keep employees motivated to get work done early and step foot in the sand. Renting this wonderful workspace may come with a high price.",
      tiles: ['0-5']
    }
  },

  // Beachside Behind (Column B)
  beachSideBehind: {
    title: "Beachside",
    description: "These are buildings next to the ocean but generally do not have ocean views.",
    singleFamilyHomes: {
      title: "City Houses",
      description: "These houses are great for smaller families. Its location makes it great for spontaneous family beach days. These houses are surrounded by taller buildings which may be distracting for some people.",
      tiles: ['1-0', '1-4', '1-5', '1-6', '1-9']
    },
    apartmentComplex: {
      title: "Apartments",
      description: "Apartments near the ocean offer residents stunning views. The beach becomes their backyard, perfect for both fun-filled and relaxing days in between their usual daily routines. Things may get busy though when summer rolls by and the peak season for vacation brings boatloads of tourists.",
      tiles: ['1-2']
    },
    hospital: {
      title: "Hospital",
      description: "A standard hospital on standby for any beach related accidents or emergency situations around the area.",
      tiles: ['1-8']
    },
    governmentBuilding: {
      title: "Government Buildings",
      description: "Fire and police stations ensure the safety of both residents and tourists around the beachside. Public schools offer education for the children of families residing in the area.",
      tiles: ['1-7']
    },
    retailCenter: {
      title: "Marketplace",
      description: "Retail shopping in the area caters to the needs and wants of residents and tourists. This marketplace gets a lot of traction during peak vacation time. Business owners must differentiate themselves well from other sellers and deliver quality products and services to survive the business competition.",
      tiles: ['1-1']
    }
  },

  // Rural Town (Column C)
  ruralTown: {
    title: "Rural Town",
    description: " This is a more isolated small town, but with basic amenities.",
    singleFamilyHomes: {
      title: "Houses",
      description: "Houses around this area are more spacious with larger front and backyards, great for bigger families or those that like to stay active outdoors. These houses are in an isolated area, making the neighborhood quiet and peaceful. Residents may need to travel farther to purchase goods and services.",
      tiles: ['4-0', '5-0', '5-1', '6-0', '6-2']
    },
    governmentBuilding: {
      title: "Government Buildings",
      description: "Fire and police stations ensure the safety of residents around the area. Since there are less people here, these buildings are on the smaller side, equipped with only the basic necessities. Public schools offer education for the children of families residing in the area.",
      tiles: ['5-2']
    },
    hospital: {
      title: "Hospital",
      description: "A standard hospital on standby for any accidents or emergency situations around the area. These are more equipped for general health care than specialized cases since there are less people around the area.",
      tiles: ['6-1']
    },
  },

  // Riverside (Column D)
  riverside: {
    title: "Riverside",
    description: " These buldings are built along the river to support industry in that area.",
    factory: {
      title: "Fishery",
      description: "The riverside provides great opportunity for industrial scale fishing. Here, fish are bred and prepared for commercial businesses. The fishery tries to make the most out of the natural resources surrounding the area.",
      tiles: ['3-4', '4-7', '5-8']
    },
    warehouse: {
      title: "Storage and Transportation Warehouse",
      description: "All the fish that are raised in the fishery are later brought here to be prepared for selling and stored for transportation. They are later taken to different areas depending on demand.",
      tiles: ['3-6', '4-5', '4-8', '5-6']
    },
    apartmentComplex: {
      title: "Apartments",
      description: "These apartments mostly house workers and their families. The fishing industry in this area attracts workers who would like to live close to where they work. The apartments make different buildings related to the industry easily accessible for the employees.",
      tiles: ['5-5']
    },
    mediumOfficeBuildings: {
      title: "Corporate Offices",
      description: "While the fishery and warehouse take care of the fish themselves, there is a lot of paperwork that needs to be done to make sure that the fish are sold properly. These corporate offices are where workers deal with the logistics, advertisement, and other aspects of the fishing industry within this area.",
      tiles: ['4-4', '5-9']
    }
  },

  // Pondside (Column E)
  pondSide: {
    title: "Pondside",
    description: "Just a small non-incorporated (not part of any city) group of houses built near a pond.",
    singleFamilyHomes: {
      title: "Country Homes",
      description: "These spacious homes are far from the hustle and bustle of the city, making them the perfect retreat for some peace and quiet. The nearby pond adds to the tranquil feel of the place. These isolated homes may be used as serene vacation homes since they are mostly surrounded by nature, without many other buildings around the area.",
      tiles: ['8-8']
    }
  },

  // Forestside (Column F)
  forestSide: {
    title: "Forestside",
    description: "Lumber-related industrial buildings.",
    factory_lumber: {
      title: "Mill",
      description: "The many trees in the area allow for a thriving wood and paper industry. This mill is where trees are manufactured into different types of lumber.",
      tiles: ['9-3']
    },
    factory_paper: {
      title: "Paper Plant",
      description: "Thanks to the abundance of trees in the area, it is also possible to use part of the trees to create paper. In this paper plant, wood is processed into paper.",
      tiles: ['8-4']
    },
    warehouse: {
      title: "Lumber Storage",
      description: "The lumber that was processed in the mills are kept here before they are later sorted and shipped off for wider distribution. Lumber here may be used for construction or furniture.",
      tiles: ['9-4', '9-5']
    },
    retailCenter: {
      title: "Paper Storage",
      description: "The paper that was made in the paper plant is sent here where it is stored before being transported for distribution across different areas depending on demand.",
      tiles: ['8-5']
    }
  },

  // Nature (Column G)
  nature: {
    title: "Nature",
    description: "These plots of land are undeveloped, although many are adjacent to developed areas.",
    windingStream: {
      title: "River",
      description: "This river runs down into the ocean. It is a natural and steady flowing stream of water.",
      tiles: ['0-2', '1-3', '2-4', '3-5', '4-6', '5-7', '6-8', '7-9']  // These will be determined by building type
    },
    meadow: {
      title: "Field",
      description: "This field is a large open space filled mostly with grassy meadows and some flowers. There are very few trees in this area. Some of this may be used for farmland.",
      tiles: []  // These will be determined by building type
    },
    sparseTreesArea: {
      title: "Sparse Woodlands",
      description: "These woodlands have more trees than the field, but not by a lot. There are also patches of grassy lands here, and some larger mammals live here too.",
      tiles: []  // These will be determined by building type
    },
    someTreesArea: {
      title: "Thicker Woodlands",
      description: "Compared to the sparse woodlands and fields, the thicker woodlands are home to more trees and wildlife.",
      tiles: []  // These will be determined by building type
    },
    thickForestedArea: {
      title: "Dense Forests",
      description: "These dense forests are thickly populated with trees, making it a treasure trove of wood that can be used as lumber or paper.",
      tiles: []  // These will be determined by building type
    },
    pond: {
      title: "Pond",
      description: "This small body of water is surrounded by land. It is adjacent to a few houses that are not a part of any city.",
      tiles: []  // These will be determined by building type
    },
  }
};

// Natural feature building types
export const naturalFeatures = [
  'sparseTreesArea',
  'someTreesArea',
  'thickForestedArea',
  'meadow',
  'pond',
  'windingStream_vertical',
  'windingStream_horizontal'
];

// Build a reverse lookup map for quick tile-to-description lookup
export const buildTileMap = () => {
  const tileMap = {};

  // Process each location
  Object.entries(locationDescriptions).forEach(([location, buildingTypes]) => {
    // Process each building type within the location
    Object.entries(buildingTypes).forEach(([buildingType, data]) => {
      // Process each tile in the building type
      if (data.tiles && data.tiles.length > 0) {
        data.tiles.forEach(tile => {
          tileMap[tile] = {
            location,
            buildingType,
            title: data.title,
            description: data.description
          };
        });
      }
    });
  });

  return tileMap;
};

// Create the tile map for quick lookups
export const tileDescriptionMap = buildTileMap();


const TileDescription = ({ buildingType, tileKey, hideTitle = false }) => {
  // Get base building type (handle vertical/horizontal variants)
  let baseType = buildingType;
  if (buildingType === 'windingStream_vertical' || buildingType === 'windingStream_horizontal') {
    baseType = 'windingStream';
  }

  // Special handling for factories in forestside area
  if (baseType === 'factory' && tileDescriptionMap[tileKey]) {
    // Check if this is a specialized factory
    const { location, buildingType } = tileDescriptionMap[tileKey];
    if (buildingType.startsWith('factory_')) {
      baseType = buildingType;
    }
  }

  // First try to get the tile description from our map
  if (tileDescriptionMap[tileKey]) {
    const { title, description } = tileDescriptionMap[tileKey];
    return (
      <div>
        {!hideTitle && <h4 className="tile-title">{title}</h4>}
        <p className="tile-description">{description}</p>
      </div>
    );
  }

  // For natural features, use the nature location
  if (naturalFeatures.includes(baseType)) {
    const natureInfo = locationDescriptions.nature[baseType];
    if (natureInfo) {
      return (
        <div>
          {!hideTitle && <h4 className="tile-title">{natureInfo.title}</h4>}
          <p className="tile-description">{natureInfo.description}</p>
        </div>
      );
    }
  }

  // If we couldn't find a description, use a default
  const formattedType = baseType
    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter

  return (
    <div>
      {!hideTitle && <h4 className="tile-title">{formattedType}</h4>}
      <p className="tile-description">No specific description available for this area.</p>
    </div>
  );
};

export default TileDescription;