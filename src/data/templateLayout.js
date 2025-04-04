// src/data/templateLayout.js

// Abbreviation mapping for readability
const abbreviations = {
    thickForestedArea: "TFA",
    someTreesArea: "STA",
    singleFamilyHomes: "SFH",
    sparseTreesArea: "SPT",
    pond: "PND",
    meadow: "MDW",
    retailCenter: "RET",
    apartmentComplex: "APT",
    windingStream_vertical: "WSV",
    windingStream_horizontal: "WSH",
    hospital: "HSP",
    mediumOfficeBuildings: "MOB",
    governmentBuilding: "GOV",
    warehouse: "WAR",
    tallOfficeBuilding: "TOB",
    hotels: "HTL",
    factory: "FAC",
};

// Reverse mapping for converting back to full names
const fullNames = Object.fromEntries(
    Object.entries(abbreviations).map(([key, value]) => [value, key])
);

// Layout in abbreviated form for readability
const layoutAbbr = [
    ["APT", "APT", "WSV", "APT", "APT", "TOB", "HTL", "APT", "HTL", "APT"],
    ["SFH", "RET", "APT", "WSV", "SFH", "SFH", "SFH", "GOV", "HSP", "SFH"],
    ["SPT", "MDW", "MDW", "SPT", "WSV", "SPT", "SPT", "MDW", "MDW", "MDW"],
    ["STA", "SPT", "MDW", "SPT", "FAC", "WSV", "WAR", "SPT", "SPT", "STA"],
    ["SFH", "STA", "SPT", "SPT", "MOB", "WAR", "WSV", "FAC", "WAR", "STA"],
    ["SFH", "SFH", "GOV", "MDW", "STA", "APT", "WAR", "WSV", "FAC", "MOB"],
    ["SFH", "HSP", "SFH", "MDW", "SPT", "STA", "SPT", "SPT", "WSV", "STA"],
    ["TFA", "TFA", "TFA", "TFA", "TFA", "STA", "STA", "STA", "PND", "WSV"],
    ["TFA", "TFA", "TFA", "TFA", "FAC", "WAR", "MDW", "MDW", "SFH", "SPT"],
    ["TFA", "TFA", "TFA", "FAC", "WAR", "WAR", "MDW", "MDW", "SPT", "SPT"]
];

// Convert abbreviated layout to full names for export
export const templateLayout = layoutAbbr.map(row =>
    row.map(abbr => fullNames[abbr])
);