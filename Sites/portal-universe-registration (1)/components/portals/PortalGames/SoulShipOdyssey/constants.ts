
import { Achievement, GridCell, Ship } from "./types";

export const GRID_SIZE = 10;
export const INITIAL_SOULS = 5000;
export const TRAVEL_TIME_PER_SQUARE = 30000; // 30 seconds in milliseconds
export const XP_PER_LEVEL_BASE = 100;

export const UPGRADE_COSTS: { [key in keyof import('./types').ShipUpgrades]: number[] } = {
    hullPlating: [50, 120, 250, 500],
    engineEfficiency: [60, 140, 300, 600],
    resourceExtraction: [40, 100, 220, 450],
    scannerProbes: [30, 75, 150, 300],
};

export const UPGRADE_BENEFITS = {
    hullPlating: [100, 110, 125, 145, 170], // max hull per level
    engineEfficiency: [1.0, 0.9, 0.8, 0.7, 0.6], // travel time multiplier
    resourceExtraction: [1.0, 1.1, 1.25, 1.4, 1.6], // resource gain multiplier
    scannerProbes: [3, 4, 5, 6, 7] // max scans per level
};


export const ACHIEVEMENTS_LIST: Omit<Achievement, 'isUnlocked'>[] = [
    {
        id: 'explorer_1',
        name: 'First Contact',
        description: 'Explore your first sector.',
        xpReward: 25,
        condition: (ship: Ship, grid: GridCell[][]) => grid.flat().filter(c => c.isExplored).length > 1
    },
    {
        id: 'explorer_10',
        name: 'Seasoned Surveyor',
        description: 'Explore 10 sectors.',
        xpReward: 100,
        condition: (ship: Ship, grid: GridCell[][]) => grid.flat().filter(c => c.isExplored).length >= 10
    },
    {
        id: 'owner_5',
        name: 'Budding Empire',
        description: 'Claim 5 sectors.',
        xpReward: 50,
        condition: (ship: Ship, grid: GridCell[][]) => grid.flat().filter(c => c.owner === 'player').length >= 5
    },
    {
        id: 'survivor_1',
        name: 'Field Tested',
        description: 'Successfully resolve an in-transit event.',
        xpReward: 30,
        condition: (ship: Ship) => ship.xp > 0 // Placeholder, will be triggered manually
    },
    {
        id: 'high_hull',
        name: 'Shields Up',
        description: 'Finish a journey with over 90% hull integrity.',
        xpReward: 20,
        condition: (ship: Ship) => (ship.hull / ship.maxHull) > 0.9 // Checked on arrival
    },
    {
        id: 'level_2',
        name: 'First Promotion',
        description: 'Reach Level 2.',
        xpReward: 50,
        condition: (ship: Ship) => ship.level >= 2
    },
];