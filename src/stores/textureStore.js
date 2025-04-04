import { create } from 'zustand';
import { TextureLoader } from 'three';

const getAssetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

const useTextureStore = create((set) => ({
  // Canvas textures
  textureUrls: {
    emptyTile: 'assets/textures/tiles/nature/env_blank.png',
    road: 'assets/textures/tiles/road/bldg_road_c.png',

    // hospital
    hospital: 'assets/textures/tiles/hospital/bldg_hospital.png',
    hospital_cool: 'assets/textures/tiles/hospital/bldg_hospital_cool.png',
    hospital_garden: 'assets/textures/tiles/hospital/bldg_hospital_garden.png',
    hospital_solar: 'assets/textures/tiles/hospital/bldg_hospital_solar.png',
    hospital_trees: 'assets/textures/tiles/hospital/bldg_hospital_trees.png',
    hospital_cool_trees:
      'assets/textures/tiles/hospital/bldg_hospital_cool_trees.png',
    hospital_solar_trees:
      'assets/textures/tiles/hospital/bldg_hospital_solar_trees.png',
    hospital_garden_trees:
      'assets/textures/tiles/hospital/bldg_hospital_garden_trees.png',
    // retail center
    retailCenter: 'assets/textures/tiles/retail/bldg_retail.png',
    retailCenter_cool: 'assets/textures/tiles/retail/bldg_retail_cool.png',
    retailCenter_garden: 'assets/textures/tiles/retail/bldg_retail_garden.png',
    retailCenter_solar: 'assets/textures/tiles/retail/bldg_retail_solar.png',
    retailCenter_trees: 'assets/textures/tiles/retail/bldg_retail_trees.png',
    retailCenter_cool_trees:
      'assets/textures/tiles/retail/bldg_retail_cool_trees.png',
    retailCenter_solar_trees:
      'assets/textures/tiles/retail/bldg_retail_solar_trees.png',
    retailCenter_garden_trees:
      'assets/textures/tiles/retail/bldg_retail_garden_trees.png',
    // govt buildings
    governmentBuilding: 'assets/textures/tiles/govt/bldg_govt.png',
    governmentBuilding_cool: 'assets/textures/tiles/govt/bldg_govt_cool.png',
    governmentBuilding_solar: 'assets/textures/tiles/govt/bldg_govt_solar.png',
    governmentBuilding_garden:
      'assets/textures/tiles/govt/bldg_govt_garden.png',
    governmentBuilding_trees: 'assets/textures/tiles/govt/bldg_govt_trees.png',
    governmentBuilding_cool_trees:
      'assets/textures/tiles/govt/bldg_govt_cool_trees.png',
    governmentBuilding_solar_trees:
      'assets/textures/tiles/govt/bldg_govt_solar_trees.png',
    governmentBuilding_garden_trees:
      'assets/textures/tiles/govt/bldg_govt_garden_trees.png',
    // hotel
    hotels: 'assets/textures/tiles/hotel/bldg_hotel.png',
    hotels_cool: 'assets/textures/tiles/hotel/bldg_hotel_cool.png',
    hotels_garden: 'assets/textures/tiles/hotel/bldg_hotel_garden.png',
    hotels_solar: 'assets/textures/tiles/hotel/bldg_hotel_solar.png',
    hotels_trees: 'assets/textures/tiles/hotel/bldg_hotel_trees.png',
    hotels_cool_trees: 'assets/textures/tiles/hotel/bldg_hotel_cool_trees.png',
    hotels_solar_trees:
      'assets/textures/tiles/hotel/bldg_hotel_solar_trees.png',
    hotels_garden_trees:
      'assets/textures/tiles/hotel/bldg_hotel_garden_trees.png',
    // apartments
    apartmentComplex: 'assets/textures/tiles/apartment/bldg_apartment.png',
    apartmentComplex_cool:
      'assets/textures/tiles/apartment/bldg_apartment_cool.png',
    apartmentComplex_solar:
      'assets/textures/tiles/apartment/bldg_apartment_solar.png',
    apartmentComplex_garden:
      'assets/textures/tiles/apartment/bldg_apartment_garden.png',
    apartmentComplex_trees:
      'assets/textures/tiles/apartment/bldg_apartment_trees.png',
    apartmentComplex_cool_trees:
      'assets/textures/tiles/apartment/bldg_apartment_cool_trees.png',
    apartmentComplex_solar_trees:
      'assets/textures/tiles/apartment/bldg_apartment_solar_trees.png',
    apartmentComplex_garden_trees:
      'assets/textures/tiles/apartment/bldg_apartment_garden_trees.png',
    // houses
    singleFamilyHomes: 'assets/textures/tiles/house/bldg_house.png',
    singleFamilyHomes_cool: 'assets/textures/tiles/house/bldg_house_cool.png',
    singleFamilyHomes_solar: 'assets/textures/tiles/house/bldg_house_solar.png',
    singleFamilyHomes_trees: 'assets/textures/tiles/house/bldg_house_trees.png',
    singleFamilyHomes_cool_trees:
      'assets/textures/tiles/house/bldg_house_cool_trees.png',
    singleFamilyHomes_solar_trees:
      'assets/textures/tiles/house/bldg_house_solar_trees.png',
    // factories
    factory: 'assets/textures/tiles/factory/bldg_factory.png',
    factory_cool: 'assets/textures/tiles/factory/bldg_factory_cool.png',
    factory_solar: 'assets/textures/tiles/factory/bldg_factory_solar.png',
    factory_trees: 'assets/textures/tiles/factory/bldg_factory_trees.png',
    factory_cool_trees:
      'assets/textures/tiles/factory/bldg_factory_cool_trees.png',
    factory_solar_trees:
      'assets/textures/tiles/factory/bldg_factory_solar_trees.png',
    // medium offices
    mediumOfficeBuildings: 'assets/textures/tiles/office/bldg_md_office.png',
    mediumOfficeBuildings_cool:
      'assets/textures/tiles/office/bldg_md_office_cool.png',
    mediumOfficeBuildings_solar:
      'assets/textures/tiles/office/bldg_md_office_solar.png',
    mediumOfficeBuildings_garden:
      'assets/textures/tiles/office/bldg_md_office_garden.png',
    mediumOfficeBuildings_trees:
      'assets/textures/tiles/office/bldg_md_office_trees.png',
    mediumOfficeBuildings_cool_trees:
      'assets/textures/tiles/office/bldg_md_office_cool_trees.png',
    mediumOfficeBuildings_garden_trees:
      'assets/textures/tiles/office/bldg_md_office_garden_trees.png',
    mediumOfficeBuildings_solar_trees:
      'assets/textures/tiles/office/bldg_md_office_solar_trees.png',
    // tall offices
    tallOfficeBuilding: 'assets/textures/tiles/office/bldg_tl_office.png',
    tallOfficeBuilding_cool:
      'assets/textures/tiles/office/bldg_tl_office_cool.png',
    tallOfficeBuilding_garden:
      'assets/textures/tiles/office/bldg_tl_office_garden.png',
    tallOfficeBuilding_solar:
      'assets/textures/tiles/office/bldg_tl_office_solar.png',
    tallOfficeBuilding_trees:
      'assets/textures/tiles/office/bldg_tl_office_trees.png',
    tallOfficeBuilding_cool_trees:
      'assets/textures/tiles/office/bldg_tl_office_cool_trees.png',
    tallOfficeBuilding_garden_trees:
      'assets/textures/tiles/office/bldg_tl_office_garden_trees.png',
    tallOfficeBuilding_solar_trees:
      'assets/textures/tiles/office/bldg_tl_office_solar_trees.png',
    // warehouses
    warehouse: 'assets/textures/tiles/warehouse/bldg_warehouse.png',
    warehouse_cool: 'assets/textures/tiles/warehouse/bldg_warehouse_cool.png',
    warehouse_garden:
      'assets/textures/tiles/warehouse/bldg_warehouse_garden.png',
    warehouse_solar: 'assets/textures/tiles/warehouse/bldg_warehouse_solar.png',
    warehouse_trees: 'assets/textures/tiles/warehouse/bldg_warehouse_trees.png',
    warehouse_cool_trees:
      'assets/textures/tiles/warehouse/bldg_warehouse_cool_trees.png',
    warehouse_solar_trees:
      'assets/textures/tiles/warehouse/bldg_warehouse_solar_trees.png',
    warehouse_garden_trees:
      'assets/textures/tiles/warehouse/bldg_warehouse_garden_trees.png',

    // nature features
    sparseTreesArea: 'assets/textures/tiles/nature/env_forest_sparse.png',
    someTreesArea: 'assets/textures/tiles/nature/env_forest_some.png',
    thickForestedArea: 'assets/textures/tiles/nature/env_forest_thick.png',
    // windingStream: 'assets/textures/tiles/nature/env_stream_single.png',
    windingStream_vertical: 'assets/textures/tiles/nature/env_stream_ver.png',
    windingStream_horizontal: 'assets/textures/tiles/nature/env_stream_hor.png',
    meadow: 'assets/textures/tiles/nature/env_meadow.png',
    pond: 'assets/textures/tiles/nature/env_pond.png',
    // natureCrossing
    natureCrossing_north_front:
      'assets/textures/tiles/nature/nature-crossing/env_nature_crossing_n_front.png',
    natureCrossing_south_front:
      'assets/textures/tiles/nature/nature-crossing/env_nature_crossing_s_front.png',
    natureCrossing_east_front:
      'assets/textures/tiles/nature/nature-crossing/env_nature_crossing_e_front.png',
    natureCrossing_west_front:
      'assets/textures/tiles/nature/nature-crossing/env_nature_crossing_w_front.png',
    natureCrossing_north_back:
      'assets/textures/tiles/nature/nature-crossing/env_nature_crossing_n_back.png',
    natureCrossing_south_back:
      'assets/textures/tiles/nature/nature-crossing/env_nature_crossing_s_back.png',
    natureCrossing_east_back:
      'assets/textures/tiles/nature/nature-crossing/env_nature_crossing_e_back.png',
    natureCrossing_west_back:
      'assets/textures/tiles/nature/nature-crossing/env_nature_crossing_w_back.png',

    // overlay textures
    highlightTextureA: 'assets/textures/highlight_a.png',
    highlightTextureB: 'assets/textures/highlight_b.png',
    pointerA: 'assets/textures/pointer_a.png',
    pointerB: 'assets/textures/pointer_b.png',

    // vehicles
    truckN: 'assets/textures/cars/truck/truck_N.png',
    truckS: 'assets/textures/cars/truck/truck_S.png',
    truckW: 'assets/textures/cars/truck/truck_W.png',
    truckE: 'assets/textures/cars/truck/truck_E.png',
    truck2N: 'assets/textures/cars/truck/truck_2_N.png',
    truck2S: 'assets/textures/cars/truck/truck_2_S.png',
    truck2W: 'assets/textures/cars/truck/truck_2_W.png',
    truck2E: 'assets/textures/cars/truck/truck_2_E.png',
    truck3N: 'assets/textures/cars/truck/truck_3_N.png',
    truck3S: 'assets/textures/cars/truck/truck_3_S.png',
    truck3W: 'assets/textures/cars/truck/truck_3_W.png',
    truck3E: 'assets/textures/cars/truck/truck_3_E.png',

    sedanN: 'assets/textures/cars/sedan/sedan_N.png',
    sedanS: 'assets/textures/cars/sedan/sedan_S.png',
    sedanW: 'assets/textures/cars/sedan/sedan_W.png',
    sedanE: 'assets/textures/cars/sedan/sedan_E.png',
    sedan2N: 'assets/textures/cars/sedan/sedan_2_N.png',
    sedan2S: 'assets/textures/cars/sedan/sedan_2_S.png',
    sedan2W: 'assets/textures/cars/sedan/sedan_2_W.png',
    sedan2E: 'assets/textures/cars/sedan/sedan_2_E.png',
    sedan3N: 'assets/textures/cars/sedan/sedan_3_N.png',
    sedan3S: 'assets/textures/cars/sedan/sedan_3_S.png',
    sedan3W: 'assets/textures/cars/sedan/sedan_3_W.png',
    sedan3E: 'assets/textures/cars/sedan/sedan_3_E.png',
    sedan4N: 'assets/textures/cars/sedan/sedan_4_N.png',
    sedan4S: 'assets/textures/cars/sedan/sedan_4_S.png',
    sedan4W: 'assets/textures/cars/sedan/sedan_4_W.png',
    sedan4E: 'assets/textures/cars/sedan/sedan_4_E.png',
    sedan5N: 'assets/textures/cars/sedan/sedan_5_N.png',
    sedan5S: 'assets/textures/cars/sedan/sedan_5_S.png',
    sedan5W: 'assets/textures/cars/sedan/sedan_5_W.png',
    sedan5E: 'assets/textures/cars/sedan/sedan_5_E.png',

    vanN: 'assets/textures/cars/van/van_N.png',
    vanS: 'assets/textures/cars/van/van_S.png',
    vanW: 'assets/textures/cars/van/van_W.png',
    vanE: 'assets/textures/cars/van/van_E.png',
    van2N: 'assets/textures/cars/van/van_2_N.png',
    van2S: 'assets/textures/cars/van/van_2_S.png',
    van2W: 'assets/textures/cars/van/van_2_W.png',
    van2E: 'assets/textures/cars/van/van_2_E.png',
    van3N: 'assets/textures/cars/van/van_3_N.png',
    van3S: 'assets/textures/cars/van/van_3_S.png',
    van3W: 'assets/textures/cars/van/van_3_W.png',
    van3E: 'assets/textures/cars/van/van_3_E.png',

    // neighboring city textures png
    north: 'assets/textures/tiles/neighboring-city-png/north-normal.png',
    northHover: 'assets/textures/tiles/neighboring-city-png/north_hover.png',
    northActive: 'assets/textures/tiles/neighboring-city-png/north-onclick.png',
    south: 'assets/textures/tiles/neighboring-city-png/south-normal.png',
    southHover: 'assets/textures/tiles/neighboring-city-png/south_hover.png',
    southActive: 'assets/textures/tiles/neighboring-city-png/south-onclick.png',
    east: 'assets/textures/tiles/neighboring-city-png/east-normal.png',
    eastHover: 'assets/textures/tiles/neighboring-city-png/east_hover.png',
    eastActive: 'assets/textures/tiles/neighboring-city-png/east-onclick.png',
    west: 'assets/textures/tiles/neighboring-city-png/west-normal.png',
    westHover: 'assets/textures/tiles/neighboring-city-png/west_hover.png',
    westActive: 'assets/textures/tiles/neighboring-city-png/west-onclick.png',

    // feedback animations
    smileyFace: 'assets/ui/feedback/smiley.png',
    nature: 'assets/ui/feedback/nature-white.webp',
    air: 'assets/ui/feedback/air-white.webp',
    water: 'assets/ui/feedback/water-white.webp',
    population: 'assets/ui/feedback/population-white.webp',
    wildlife: 'assets/ui/feedback/wildlife-white.webp',
    thermometer: 'assets/ui/feedback/thermometer.svg',

    // Lock icon
    lockIcon: 'assets/ui/lock_icon.svg',
  },
  // UI images
  imageUrls: {
    // UI Start Screen
    title: 'assets/ui/title_main.png',
    // UI BuildingInfo
    apartmentComplex: 'assets/ui/buildings/bldg_apartment_sm.png',
    factory: 'assets/ui/buildings/bldg_factory_sm.png',
    governmentBuilding: 'assets/ui/buildings/bldg_govt_sm.png',
    hospital: 'assets/ui/buildings/bldg_hospital_sm.png',
    hotels: 'assets/ui/buildings/bldg_hotel_sm.png',
    mediumOfficeBuildings: 'assets/ui/buildings/bldg_md_office_sm.png',
    retailCenter: 'assets/ui/buildings/bldg_retail_sm.png',
    singleFamilyHomes: 'assets/ui/buildings/bldg_house_sm.png',
    tallOfficeBuilding: 'assets/ui/buildings/bldg_tl_office_sm.png',
    warehouse: 'assets/ui/buildings/bldg_warehouse_sm.png',
    // Green mods
    coolRoof: 'assets/ui/green-mods/icon_cool_roof.png',
    greenRoof: 'assets/ui/green-mods/icon_green_roof.png',
    natureCrossings: 'assets/ui/green-mods/icon_nature_crossing.png',
    solarRoof: 'assets/ui/green-mods/icon_solar.png',
    treeLinedStreets: 'assets/ui/green-mods/icon_street_trees.png',
    // top right menu
    info: 'assets/ui/upper-right-menu/graph-button.svg',

    // title images
    title_ess: 'assets/ess/title_ess.png',
    title_pp: 'assets/pp/title_pp.png',
    title_lwl: 'assets/lwl/title_lwl.png',
    title_aag: 'assets/aag/title_aag.png',
    title_ee: 'assets/ee/title_ee.png',
  },

  // ** Store Preloaded Assets **
  preloadedTextures: {},
  preloadedUIImages: {},

  // Loading States
  loadingTextures: true,
  loadingUIImages: true,

  setPreloadedTextures: (textures) =>
    set({ preloadedTextures: textures, loadingTextures: false }),
  setPreloadedUIImages: (images) =>
    set({ preloadedUIImages: images, loadingUIImages: false }),

  setLoading: (loading) => set({ loading }),

  loadTextures: () => {
    set({ loading: true });
    const loader = new TextureLoader();
    const { textureUrls } = useTextureStore.getState();
    const textures = {};

    Object.keys(textureUrls).forEach((key) => {
      // Apply getAssetPath when loading the texture
      const assetPath = getAssetPath(textureUrls[key]);
      loader.load(assetPath, (texture) => {
        textures[key] = texture;
        if (Object.keys(textures).length === Object.keys(textureUrls).length) {
          useTextureStore.getState().setPreloadedTextures(textures);
        }
      });
    });
  },

  loadUIImages: () => {
    const { imageUrls } = useTextureStore.getState();
    const images = {};
    let loadedCount = 0;
    const totalImages = Object.keys(imageUrls).length;

    Object.keys(imageUrls).forEach((key) => {
      const img = new Image();
      img.onload = () => {
        images[key] = img;
        loadedCount++;
        if (loadedCount === totalImages) {
          useTextureStore.getState().setPreloadedUIImages(images);
        }
      };
      // Apply getAssetPath when setting the image source
      img.src = getAssetPath(imageUrls[key]);
    });
  },
}));

export default useTextureStore;
