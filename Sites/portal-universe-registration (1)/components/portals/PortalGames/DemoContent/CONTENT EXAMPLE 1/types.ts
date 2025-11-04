
export enum SectorType {
  EmptySpace = 'Empty Space',
  AsteroidField = 'Dense Asteroid Field',
  Nebula = 'Vibrant Nebula',
  StarSystem = 'Young Star System',
  BlackHole = 'Nearby Black Hole',
  Anomaly = 'Strange Anomaly',
}

export interface GridCell {
  x: number;
  y: number;
  type: SectorType;
  isExplored: boolean;
  owner: 'player' | 'neutral';
}

export type ShipStatus = 'IDLE' | 'TRAVELING';

export interface ShipUpgrades {
  hullPlating: number; // Increases max hull
  engineEfficiency: number; // Decreases travel time
  resourceExtraction: number; // Increases resource gains
  scannerProbes: number; // Increases max scans
}

export type ShipType = 'voyager' | 'interceptor' | 'hauler';

export interface ShipCustomization {
  shipType: ShipType;
}

export interface Ship {
  x: number;
  y: number;
  souls: number;
  status: ShipStatus;
  hull: number; 
  maxHull: number;
  energy: number;
  resources: number;
  level: number;
  xp: number;
  scans: number;
  maxScans: number;
  upgrades: ShipUpgrades;
  customization: ShipCustomization;
}

export interface TravelInfo {
  destinationX: number;
  destinationY: number;
  startTime: number;
  duration: number;
  timeRemaining: number;
}

export interface InteractiveEvent {
    id: string;
    description: string;
    choices: string[];
}

export interface Achievement {
  id:string;
  name: string;
  description:string;
  isUnlocked: boolean;
  xpReward: number;
  condition: (ship: Ship, grid: GridCell[][]) => boolean;
}

export type NotificationType = 'achievement' | 'levelup' | 'info' | 'warning' | 'save';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}