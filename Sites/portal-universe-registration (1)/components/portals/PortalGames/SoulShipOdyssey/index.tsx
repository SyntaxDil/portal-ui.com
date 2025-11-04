import React, { useState, useEffect, useCallback, useRef } from 'react';
import GamePage from './components/GamePage';
import { Ship, GridCell, TravelInfo, SectorType, InteractiveEvent, Achievement, Notification, NotificationType, ShipUpgrades, ShipType } from './types';
import { GRID_SIZE, INITIAL_SOULS, TRAVEL_TIME_PER_SQUARE, XP_PER_LEVEL_BASE, ACHIEVEMENTS_LIST, UPGRADE_COSTS, UPGRADE_BENEFITS } from './constants';
import { generateSectorEvent, generateInteractiveEvent, resolveEventChoice, generateScanResult } from './services/geminiService';
import { AnomalyIcon, ScanIcon, TrophyIcon, XpIcon, SaveIcon } from './components/IconComponents';

const generateGrid = (): GridCell[][] => {
  const grid: GridCell[][] = [];
  const sectorTypes = Object.values(SectorType);
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      let type = SectorType.EmptySpace;
      const rand = Math.random();
      if (rand > 0.85) {
        type = sectorTypes[Math.floor(Math.random() * (sectorTypes.length -1)) + 1];
      }
      row.push({ x, y, type, isExplored: false, owner: 'neutral' });
    }
    grid.push(row);
  }
  return grid;
};

const Header: React.FC<{souls: number}> = ({souls}) => (
    <header className="w-full text-center p-1 border-b-2 border-[var(--border-color)] mb-2">
        <h1 className="text-2xl font-display text-[var(--primary-glow)] tracking-widest drop-shadow-[0_0_5px_var(--primary-glow)]">
            SOUL SHIP ODYSSEY
        </h1>
        <p className="text-xs font-mono">SOULS ABOARD: <span className="font-bold text-white">{souls}</span> | STATUS: <span className="text-green-400">OPERATIONAL</span></p>
    </header>
);

const NotificationToast: React.FC<{ notification: Notification, onDismiss: () => void }> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const colors = {
        achievement: 'border-yellow-400 text-yellow-300',
        levelup: 'border-green-400 text-green-300',
        info: 'border-cyan-400 text-cyan-300',
        warning: 'border-red-500 text-red-400',
        save: 'border-blue-400 text-blue-300',
    };
    const icon = {
        achievement: <TrophyIcon className="w-6 h-6 mr-2 text-yellow-400" />,
        levelup: <XpIcon className="w-6 h-6 mr-2 text-green-400" />,
        info: <ScanIcon className="w-6 h-6 mr-2 text-cyan-400" />,
        warning: <AnomalyIcon className="w-6 h-6 mr-2 text-red-500" />,
        save: <SaveIcon className="w-6 h-6 mr-2 text-blue-400" />,
    }

    return (
        <div className={`w-80 bg-slate-900/90 backdrop-blur-md border-l-4 ${colors[notification.type]} p-3 shadow-lg shadow-black/50 flex items-center animate-[slideIn_0.5s_ease-out_forwards]`}>
            {icon[notification.type]}
            <p className="text-sm font-mono flex-grow">{notification.message}</p>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    )
};


const SoulShipOdyssey: React.FC = () => {
  const getInitialShipState = (): Ship => {
      const upgrades: ShipUpgrades = { hullPlating: 0, engineEfficiency: 0, resourceExtraction: 0, scannerProbes: 0 };
      return { 
        x: 5, y: 5, souls: INITIAL_SOULS, status: 'IDLE', 
        hull: UPGRADE_BENEFITS.hullPlating[0], maxHull: UPGRADE_BENEFITS.hullPlating[0],
        energy: 100, resources: 100, level: 1, xp: 0, 
        scans: UPGRADE_BENEFITS.scannerProbes[0], maxScans: UPGRADE_BENEFITS.scannerProbes[0],
        upgrades,
        customization: { shipType: 'voyager' }
      };
  };

  const [gridData, setGridData] = useState<GridCell[][]>([]);
  const [ship, setShip] = useState<Ship>(getInitialShipState());
  const [visualShipPos, setVisualShipPos] = useState({ x: 5, y: 5 });
  const [shipRotation, setShipRotation] = useState(0);
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const [eventLog, setEventLog] = useState<{ id: number; message: string; isTyping: boolean }[]>([]);
  const [isGeneratingEvent, setIsGeneratingEvent] = useState(false);
  const [activeEvent, setActiveEvent] = useState<InteractiveEvent | null>(null);
  const [isResolvingChoice, setIsResolvingChoice] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_LIST.map(a => ({...a, isUnlocked: false})));
  const [selectedSector, setSelectedSector] = useState<GridCell | null>(null);
  const [activeView, setActiveView] = useState('game');
  const [scanResultData, setScanResultData] = useState<{ isLoading: boolean; result: Awaited<ReturnType<typeof generateScanResult>>; sectorCoords: {x:number, y:number} } | null>(null);

  const animationFrameRef = useRef<number>();
  const eventIdCounter = useRef(0);
  const notificationIdCounter = useRef(0);
  const arrivalTimerRef = useRef<number>();
  const inTransitIntervalRef = useRef<number>();
  const autoSaveTimerRef = useRef<number>();

  // FIX: Add explicit type to state setter callback to avoid potential type inference issues.
  const addNotification = useCallback((message: string, type: NotificationType) => {
    setNotifications((prev: Notification[]) => [...prev, { id: notificationIdCounter.current++, message, type }]);
  }, []);

  // FIX: Add explicit type to state setter callback to avoid potential type inference issues.
  const removeNotification = useCallback((id: number) => {
    setNotifications((prev: Notification[]) => prev.filter(n => n.id !== id));
  }, []);

  const xpToNextLevel = useCallback(() => {
    return ship.level * XP_PER_LEVEL_BASE;
  }, [ship.level]);

  const addXp = useCallback((amount: number) => {
    setShip(prev => {
        let newXp = prev.xp + amount;
        let newLevel = prev.level;
        let newScans = prev.scans;
        let levelUp = false;
        
        while (newXp >= newLevel * XP_PER_LEVEL_BASE) {
            newXp -= newLevel * XP_PER_LEVEL_BASE;
            newLevel++;
            newScans = prev.maxScans; // Replenish scans on level up
            levelUp = true;
        }

        if (levelUp) {
            addNotification(`PROMOTED! Reached Level ${newLevel}. Scanner probes replenished.`, 'levelup');
        }
        
        return { ...prev, xp: newXp, level: newLevel, scans: newScans };
    });
  }, [addNotification, ship.maxScans]);
  
  const checkAndUnlockAchievements = useCallback((currentShip: Ship, currentGrid: GridCell[][]) => {
    setAchievements(prev => {
        const newAchievements = [...prev];
        let changed = false;
        newAchievements.forEach(ach => {
            if (!ach.isUnlocked && ach.condition(currentShip, currentGrid)) {
                ach.isUnlocked = true;
                addXp(ach.xpReward);
                addNotification(`Achievement Unlocked: ${ach.name}`, 'achievement');
                changed = true;
            }
        });
        return changed ? newAchievements : prev;
    });
  }, [addXp, addNotification]);

  const logEvent = useCallback((message: string, isTyping = false) => {
    setEventLog(prev => [{ id: eventIdCounter.current++, message, isTyping }, ...prev.slice(0, 100)]);
  }, []);

  // --- SAVE & LOAD ---
  const saveGame = useCallback((isAutoSave = false) => {
      const gameState = {
          ship,
          gridData,
          achievements,
          eventLog: eventLog.slice(0, 20),
          eventIdCounter: eventIdCounter.current,
      };
      localStorage.setItem('soulShipVoyagerSave', JSON.stringify(gameState));
      if (!isAutoSave) {
        addNotification('Game Saved', 'save');
      }
  }, [ship, gridData, achievements, eventLog, addNotification]);

  const loadGame = useCallback(() => {
      const savedState = localStorage.getItem('soulShipVoyagerSave');
      if (savedState) {
          const gameState = JSON.parse(savedState);
          setShip(gameState.ship);
          setGridData(gameState.gridData);
          setAchievements(gameState.achievements);
          setEventLog(gameState.eventLog);
          eventIdCounter.current = gameState.eventIdCounter;
          setSelectedSector(gameState.gridData[gameState.ship.y][gameState.ship.x]);
          addNotification('Game Loaded Successfully', 'save');
      }
  }, [addNotification]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(() => saveGame(true), 60000); // Autosave every 60 seconds
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [ship, gridData, achievements, eventLog, saveGame]);
  
  // --- END SAVE & LOAD ---

  const handleArrival = useCallback(async (x: number, y: number) => {
    setTravelInfo(null);
    setActiveEvent(null);
    setIsGeneratingEvent(true);
    
    // FIX: Add explicit type to map parameter to ensure correct type inference for 'cell'.
    const updatedGrid = gridData.map(row =>
        row.map((cell: GridCell) =>
            cell.x === x && cell.y === y ? { ...cell, isExplored: true, owner: 'player' } : cell
        )
    );
    setGridData(updatedGrid);

    const updatedShip = { ...ship, x, y, status: 'IDLE' as const };
    setShip(updatedShip);
    setSelectedSector(updatedGrid[y][x]);

    logEvent(`Arrived at sector [${x}, ${y}]. Sector claimed. Commencing sensor sweep...`);
    addXp(10); // XP for exploring a new sector

    const sector = updatedGrid[y][x];
    const eventMessage = await generateSectorEvent(sector.type, x, y);
    logEvent(eventMessage, true);
    setIsGeneratingEvent(false);
    
    checkAndUnlockAchievements(updatedShip, updatedGrid);

  }, [gridData, logEvent, addXp, checkAndUnlockAchievements, ship]);
  
  const triggerInteractiveEvent = useCallback(async () => {
    if (activeEvent) return;
    if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
    if (inTransitIntervalRef.current) clearInterval(inTransitIntervalRef.current);
    
    setTravelInfo(prev => {
        if (!prev) return null;
        const timeRemaining = prev.startTime + prev.duration - Date.now();
        return {...prev, timeRemaining};
    });

    logEvent("Unidentified signal detected... Awaiting command decision.", true);
    const eventData = await generateInteractiveEvent();
    if (eventData) {
        setActiveEvent({ ...eventData, id: `evt_${Date.now()}`});
    } else {
        logEvent("Signal faded before we could analyze it. Resuming course.");
        if (travelInfo) {
            const timeRemaining = travelInfo.timeRemaining > 0 ? travelInfo.timeRemaining : 0;
            setTravelInfo(prev => prev ? {...prev, startTime: Date.now(), duration: timeRemaining } : null);
        }
    }
  }, [logEvent, travelInfo, activeEvent]);

  const generateInTransitEvent = useCallback(() => {
    if (Math.random() < 0.25) {
        triggerInteractiveEvent();
    }
  }, [triggerInteractiveEvent]);


  useEffect(() => {
      const savedState = localStorage.getItem('soulShipVoyagerSave');
      if(savedState) return;

      const initialGrid = generateGrid();
      const startX = Math.floor(GRID_SIZE / 2);
      const startY = Math.floor(GRID_SIZE / 2);

      initialGrid[startY][startX].isExplored = true;
      initialGrid[startY][startX].owner = 'player';
      initialGrid[startY][startX].type = SectorType.EmptySpace;

      setGridData(initialGrid);
      const initialShip = getInitialShipState();
      setShip(initialShip);
      setVisualShipPos({ x: startX, y: startY });
      setSelectedSector(initialGrid[startY][startX]);
      logEvent("Odyssey's journey begins. The fate of 5000 souls is in your hands.");
  }, [logEvent]);

  useEffect(() => {
    if (ship.status === 'TRAVELING' && travelInfo && !activeEvent) {
      arrivalTimerRef.current = window.setTimeout(() => {
        handleArrival(travelInfo.destinationX, travelInfo.destinationY);
      }, travelInfo.duration);
      inTransitIntervalRef.current = window.setInterval(generateInTransitEvent, 30000); 
      return () => { clearTimeout(arrivalTimerRef.current); clearInterval(inTransitIntervalRef.current); };
    }
  }, [ship.status, travelInfo, handleArrival, generateInTransitEvent, activeEvent]);

  useEffect(() => {
    if (ship.status !== 'TRAVELING' || !travelInfo) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVisualShipPos({x: ship.x, y: ship.y});
      return;
    }
    if (activeEvent) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }
    const animate = () => {
      const now = Date.now();
      const elapsed = now - travelInfo.startTime;
      const progress = Math.min(1, elapsed / travelInfo.duration);
      const newX = ship.x + (travelInfo.destinationX - ship.x) * progress;
      const newY = ship.y + (travelInfo.destinationY - ship.y) * progress;
      setVisualShipPos({ x: newX, y: newY });
      if (progress < 1) animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => { if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [ship.status, travelInfo, ship.x, ship.y, activeEvent]);

  const handleSetCourse = (x: number, y: number) => {
    if (activeEvent || (ship.x === x && ship.y === y)) return;
    const isRedirecting = ship.status === 'TRAVELING';
    if (isRedirecting) { clearTimeout(arrivalTimerRef.current); clearInterval(inTransitIntervalRef.current); }

    const dy = y - ship.y; const dx = x - ship.x;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    setShipRotation(angle);

    const distance = Math.sqrt(Math.pow(x - ship.x, 2) + Math.pow(y - ship.y, 2));
    const travelTimeMultiplier = UPGRADE_BENEFITS.engineEfficiency[ship.upgrades.engineEfficiency];
    const duration = distance * TRAVEL_TIME_PER_SQUARE * travelTimeMultiplier;

    setShip(prev => ({ ...prev, status: 'TRAVELING' }));
    setTravelInfo({ destinationX: x, destinationY: y, startTime: Date.now(), duration: duration, timeRemaining: duration });
    logEvent(isRedirecting ? `Course corrected. New destination: [${x}, ${y}].` : `Course plotted for [${x}, ${y}]. Engaging warp drive.`);
  };

  const handleChoice = async (choice: string) => {
    if (!activeEvent) return;
    setIsResolvingChoice(true);
    logEvent(`Acknowledged. Executing: "${choice}"...`);
    const result = await resolveEventChoice(activeEvent.description, choice);
    if (result) {
        logEvent(result.outcome, true);
        const resourceMultiplier = UPGRADE_BENEFITS.resourceExtraction[ship.upgrades.resourceExtraction];
        const finalEffects = { ...result.effects };
        if (finalEffects.resources && finalEffects.resources > 0) {
            finalEffects.resources = Math.ceil(finalEffects.resources * resourceMultiplier);
        }

        const updatedShip = { ...ship };
        if (finalEffects.hull) updatedShip.hull = Math.max(0, Math.min(updatedShip.maxHull, ship.hull + finalEffects.hull));
        if (finalEffects.energy) updatedShip.energy = Math.max(0, Math.min(100, ship.energy + finalEffects.energy));
        if (finalEffects.resources) updatedShip.resources = Math.max(0, ship.resources + finalEffects.resources);
        if (finalEffects.souls) updatedShip.souls = Math.max(0, ship.souls + finalEffects.souls);
        setShip(updatedShip);
        checkAndUnlockAchievements(updatedShip, gridData);
    } else {
        logEvent("The consequences of our actions are... unclear. The ship remains stable.");
    }
    setTravelInfo(prev => {
        if (!prev) return null;
        const timeRemaining = prev.timeRemaining > 0 ? prev.timeRemaining : 0;
        return { ...prev, startTime: Date.now(), duration: timeRemaining, timeRemaining: 0 };
    });
    setActiveEvent(null);
    setIsResolvingChoice(false);
  };
  
  const handleScanCurrentSector = async () => {
    if (ship.scans <= 0 || ship.status !== 'IDLE' || scanResultData) return;
    
    logEvent(`Expending scanner probe on sector [${ship.x}, ${ship.y}]...`);
    setShip(prev => ({...prev, scans: prev.scans - 1}));

    setScanResultData({ isLoading: true, result: null, sectorCoords: { x: ship.x, y: ship.y } });

    const currentSector = gridData[ship.y][ship.x];
    const result = await generateScanResult(currentSector.type);
    
    setScanResultData({ isLoading: false, result: result, sectorCoords: { x: ship.x, y: ship.y } });

    if (result) {
        const resourceMultiplier = UPGRADE_BENEFITS.resourceExtraction[ship.upgrades.resourceExtraction];
        const finalEffects = { ...result.effects };
        if (finalEffects.resources && finalEffects.resources > 0) {
            finalEffects.resources = Math.ceil(finalEffects.resources * resourceMultiplier);
        }

        setShip(prev => {
            const newStats = { ...prev };
            if (finalEffects.hull) newStats.hull = Math.max(0, Math.min(newStats.maxHull, prev.hull + finalEffects.hull));
            if (finalEffects.energy) newStats.energy = Math.max(0, Math.min(100, prev.energy + finalEffects.energy));
            if (finalEffects.resources) newStats.resources = Math.max(0, prev.resources + (finalEffects.resources || 0));
            return newStats;
        });
        addXp(5); // Small XP for scanning
    }
  };
  
  const handleCloseScanPanel = () => {
    setScanResultData(null);
  }

  const handleUpgrade = (system: keyof ShipUpgrades) => {
    const currentLevel = ship.upgrades[system];
    const cost = UPGRADE_COSTS[system][currentLevel];
    if(ship.resources >= cost && currentLevel < UPGRADE_COSTS[system].length) {
        setShip(prev => {
            const newUpgrades = { ...prev.upgrades, [system]: currentLevel + 1 };
            const newShip = {
                ...prev,
                resources: prev.resources - cost,
                upgrades: newUpgrades,
            };
            if(system === 'hullPlating') {
                newShip.maxHull = UPGRADE_BENEFITS.hullPlating[currentLevel + 1];
                newShip.hull = Math.min(newShip.hull, newShip.maxHull);
            }
            if(system === 'scannerProbes') {
                newShip.maxScans = UPGRADE_BENEFITS.scannerProbes[currentLevel + 1];
                newShip.scans = Math.min(newShip.scans, newShip.maxScans);
            }
            return newShip;
        });
        logEvent(`${system.replace(/([A-Z])/g, ' $1').toUpperCase()} system upgraded to level ${currentLevel + 1}.`);
    }
  };

  const handleShipTypeChange = (newType: ShipType) => {
    setShip(prev => ({...prev, customization: {...prev.customization, shipType: newType}}));
    logEvent(`Ship chassis reconfigured to ${newType.toUpperCase()} class.`);
  };

  return (
    <div className="h-full bg-gray-900 text-cyan-300 font-sans p-4 bg-cover bg-center" style={{backgroundImage: "url('https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"}}>
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {notifications.map(n => <NotificationToast key={n.id} notification={n} onDismiss={() => removeNotification(n.id)} />)}
      </div>

      <div className="relative container mx-auto flex flex-col h-full">
        <Header souls={ship.souls} />
        <div className="flex-grow relative overflow-hidden">
            <GamePage
                ship={ship}
                gridData={gridData}
                visualShipPos={visualShipPos}
                shipRotation={shipRotation}
                travelInfo={travelInfo}
                activeEvent={activeEvent}
                selectedSector={selectedSector}
                achievements={achievements}
                eventLog={eventLog}
                setEventLog={setEventLog}
                isGeneratingEvent={isGeneratingEvent}
                isResolvingChoice={isResolvingChoice}
                xpToNextLevel={xpToNextLevel}
                handleSetCourse={handleSetCourse}
                onSectorSelect={(sector) => setSelectedSector(sector)}
                handleChoice={handleChoice}
                handleScanCurrentSector={handleScanCurrentSector}
                saveGame={() => saveGame()}
                loadGame={loadGame}
                handleUpgrade={handleUpgrade}
                handleShipTypeChange={handleShipTypeChange}
                scanResultData={scanResultData}
                handleCloseScanPanel={handleCloseScanPanel}
            />
        </div>
      </div>
    </div>
  );
};
export default SoulShipOdyssey;