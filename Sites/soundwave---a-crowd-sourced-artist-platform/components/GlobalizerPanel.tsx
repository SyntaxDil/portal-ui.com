import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GlobalEvent, GlobalEventType, GlobalizerMode, UniverseGroup, Comment } from '../types';
import { getGlobalEvents, addCommentToGlobalEvent } from '../services/firebaseService';
import { Icon } from './Icon';
import Spinner from './Spinner';
import CommentModal from './CommentModal';
import Button from './Button';

const getIconName = (type: GlobalEventType) => {
    switch (type) {
        case GlobalEventType.NEW_TRACK: return 'music-note';
        case GlobalEventType.NEW_PHOTO: return 'camera';
        case GlobalEventType.IRL_EVENT: return 'map-pin';
        default: return 'chat-bubble'; // Fallback
    }
};

const EventPing: React.FC<{
    event: GlobalEvent;
    onClick: (event: GlobalEvent) => void;
    onMouseEnter: (event: GlobalEvent) => void;
    onMouseLeave: () => void;
    className?: string;
    isDimmed?: boolean;
    isHighlighted?: boolean;
    size?: number;
}> = ({ event, onClick, onMouseEnter, onMouseLeave, className = "event-ping", isDimmed, isHighlighted, size = 32 }) => {
    const iconSize = size * 0.6;
    return (
        <div
            className={`${className} ${isDimmed ? 'dimmed' : ''}`}
            style={{ 
                transform: event.transform, 
                animationDelay: event.animationDelay,
                width: `${size}px`,
                height: `${size}px`,
                marginLeft: `${-size / 2}px`,
                marginTop: `${-size / 2}px`,
            }}
            onMouseEnter={() => onMouseEnter(event)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(event)}
            aria-label={`Event: ${event.title}`}
        >
            <div className={`event-ping-icon ${isHighlighted ? 'highlight' : ''}`} style={{ animationDelay: event.animationDelay }}>
                <Icon name={getIconName(event.type)} className="transition-all" style={{ width: iconSize, height: iconSize }} />
            </div>
        </div>
    );
};

const ModeSwitcher: React.FC<{
    mode: GlobalizerMode;
    setMode: (mode: GlobalizerMode) => void;
}> = ({ mode, setMode }) => {
    const baseClasses = "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors";
    const activeClasses = "bg-brand-accent text-white";
    const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

    const modes = [
        { key: GlobalizerMode.GEO, icon: 'globe-alt', label: 'Geo' },
        { key: GlobalizerMode.UNIVERSE, icon: 'aperture', label: 'Universe' },
        { key: GlobalizerMode.COUNTRY, icon: 'map', label: 'Countries' },
    ];

    return (
        <div className="flex space-x-2 p-1 bg-gray-900/50 rounded-full">
            {modes.map(({ key, icon, label }) => (
                 <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`${baseClasses} ${mode === key ? activeClasses : inactiveClasses}`}
                >
                    <Icon name={icon} className="w-4 h-4" />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
};


const GlobalizerPanel: React.FC = () => {
    const SLICE_COUNT = 12;
    const [events, setEvents] = useState<GlobalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<GlobalizerMode>(GlobalizerMode.GEO);
    
    // UI State
    const [hoveredEvent, setHoveredEvent] = useState<GlobalEvent | null>(null);
    const [commentModalTarget, setCommentModalTarget] = useState<GlobalEvent | null>(null);
    const [hoveredCountry, setHoveredCountry] = useState<{name: string, count: number} | null>(null);
    const [zoom, setZoom] = useState(1);

    // Universe Mode State
    const [cameraRotation, setCameraRotation] = useState({ x: -20, y: 30 });
    const [cameraTarget, setCameraTarget] = useState({ x: 0, y: 0, z: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const [focusedGroup, setFocusedGroup] = useState<string | null>(null);
    const myBubbles = ["@Artist:Sub-Tropical", "@Genre:Jungle", "@Genre:LiquidFunk"];

    // Country Mode State
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

    useEffect(() => {
        getGlobalEvents().then(fetchedEvents => {
            setEvents(fetchedEvents);
            setLoading(false);
        });
    }, []);

    // Reset interaction states when mode changes
    useEffect(() => {
        setHoveredEvent(null);
        setHoveredCountry(null);
        setFocusedGroup(null);
        setSelectedCountry(null);
        setCameraTarget({ x: 0, y: 0, z: 0 });
        setZoom(1); // Reset zoom on mode change
    }, [mode]);

    const universeNodes = useMemo((): UniverseGroup[] => {
        if (mode !== GlobalizerMode.UNIVERSE) return [];
        const groupCounts = new Map<string, number>();
        events.forEach(event => {
            event.groups.forEach(group => {
                const masterGroup = group.split(':')[0];
                groupCounts.set(masterGroup, (groupCounts.get(masterGroup) || 0) + 1);
            });
        });
        const masterGroups = Array.from(groupCounts.keys());
        return masterGroups.map((group, i) => {
            const angle = (i / masterGroups.length) * 2 * Math.PI;
            const yAngle = Math.random() * Math.PI - Math.PI / 2;
            const radius = 120 + (Math.random() * 20);
            const x = Math.cos(angle) * Math.cos(yAngle) * radius;
            const z = Math.sin(angle) * Math.cos(yAngle) * radius;
            const y = Math.sin(yAngle) * radius;
            return {
                name: group,
                transform: `translateX(-50%) translateY(-50%) translateX(${x}px) translateY(${y}px) translateZ(${z}px) rotateY(${-angle}rad) rotateX(${-yAngle}rad)`,
                position: { x, y, z },
                influence: groupCounts.get(group) || 1,
            };
        });
    }, [events, mode]);

    const countryData = useMemo(() => {
        if (mode !== GlobalizerMode.COUNTRY) return [];

        const eventsByCountry = events.reduce((acc, event) => {
            acc[event.country] = acc[event.country] || [];
            acc[event.country].push(event);
            return acc;
        }, {} as Record<string, GlobalEvent[]>);
        
        const countryLayout: Record<string, { top: string, left: string }> = {
            'United Kingdom': { top: '40%', left: '45%' },
            'Germany': { top: '42%', left: '55%' },
            'Jamaica': { top: '70%', left: '25%' },
            'Japan': { top: '50%', left: '85%' },
        };

        return Object.entries(eventsByCountry).map(([name, countryEvents]) => ({
            name,
            count: countryEvents.length,
            events: countryEvents,
            position: countryLayout[name] || { top: '50%', left: '50%'}
        }));
    }, [events, mode]);
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault(); // Prevent page from scrolling
        const zoomFactor = 0.001;
        setZoom(prev => Math.max(0.5, Math.min(3, prev - e.deltaY * zoomFactor)));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        setCameraRotation(prev => ({
            y: prev.y + dx * 0.2,
            x: Math.max(-90, Math.min(90, prev.x - dy * 0.2))
        }));
    };
    
    const handleNodeClick = (node: UniverseGroup) => {
        if (focusedGroup === node.name) {
            // Unfocus if clicking the same node
            setFocusedGroup(null);
            setCameraTarget({ x: 0, y: 0, z: 0 });
        } else {
            // Focus on the new node
            setFocusedGroup(node.name);
            setCameraTarget({ x: -node.position.x, y: -node.position.y, z: -node.position.z });
        }
    };

    const handleAddComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
        if (!commentModalTarget) return;
        try {
            const newComment = await addCommentToGlobalEvent(commentModalTarget.id, commentData);
            const updatedTarget = { ...commentModalTarget, comments: [...(commentModalTarget.comments || []), newComment]};
            setCommentModalTarget(updatedTarget);
            setEvents(prev => prev.map(e => e.id === updatedTarget.id ? updatedTarget : e));
        } catch (error) {
            console.error("Failed to add comment to event:", error);
        }
    };
    
    const globeSlices = Array.from({ length: SLICE_COUNT }).map((_, i) => (
        <div key={i} className="globe-slice" style={{ transform: `rotateY(${(180 / SLICE_COUNT) * i}deg)` }} />
    ));
    
    const getTitle = () => {
        switch(mode) {
            case GlobalizerMode.GEO: return 'Global Activity';
            case GlobalizerMode.UNIVERSE: return 'Musical Universe';
            case GlobalizerMode.COUNTRY: return 'Community Hotspots';
            default: return 'Activity Hub';
        }
    }

    const getSubtitle = () => {
         switch(mode) {
            case GlobalizerMode.GEO: return 'Real-time user activity by location.';
            case GlobalizerMode.UNIVERSE: return 'Click a bubble to focus. Drag to orbit.';
            case GlobalizerMode.COUNTRY: return 'Scroll to zoom. Click a bubble to explore.';
            default: return 'See what\'s happening now.';
        }
    }

    return (
        <>
            {commentModalTarget && (
                <CommentModal
                isOpen={!!commentModalTarget}
                onClose={() => setCommentModalTarget(null)}
                title={`Comments for ${commentModalTarget.title}`}
                comments={commentModalTarget.comments || []}
                onAddComment={handleAddComment}
                />
            )}
            <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-[500px] p-4 text-center items-center justify-between relative overflow-hidden">
                <div className="relative z-20 flex justify-between w-full items-start">
                    <div className="text-left">
                        <h4 className="font-bold text-white text-lg">{getTitle()}</h4>
                        <p className="text-sm text-gray-400 max-w-xs">{getSubtitle()}</p>
                    </div>
                    <ModeSwitcher mode={mode} setMode={setMode} />
                </div>
            
                <div className="flex-grow flex items-center justify-center w-full h-full relative">
                    {loading ? <Spinner /> : (
                        <>
                        {mode === GlobalizerMode.GEO && (
                            <div className="globe-container">
                                <div className="relative">
                                    <div className="globe">
                                        {globeSlices}
                                        {events.map((event) => (
                                            <EventPing key={event.id} event={event} onClick={setCommentModalTarget} onMouseEnter={setHoveredEvent} onMouseLeave={() => setHoveredEvent(null)} />
                                        ))}
                                    </div>
                                    <div className="globe-shadow"></div>
                                </div>
                            </div>
                        )}
                        {mode === GlobalizerMode.UNIVERSE && (
                            <div className="universe-container" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove} onWheel={handleWheel}>
                                <div className="universe-core" style={{ 
                                    transform: `
                                        rotateX(${cameraRotation.x}deg) 
                                        rotateY(${cameraRotation.y}deg) 
                                        translateX(${cameraTarget.x * zoom}px) 
                                        translateY(${cameraTarget.y * zoom}px) 
                                        translateZ(${cameraTarget.z * zoom}px) 
                                        scale(${zoom})
                                    `
                                }}>
                                    {universeNodes.map(node => {
                                        const size = 40 + node.influence * 8;
                                        const alpha = Math.min(0.1 + node.influence * 0.05, 0.7);
                                        return (
                                            <div key={node.name} className={`universe-node ${focusedGroup === node.name ? 'focused' : ''} ${focusedGroup && focusedGroup !== node.name ? 'dimmed': ''}`}
                                                style={{ 
                                                    transform: node.transform, 
                                                    fontSize: `${8 + node.influence * 1.5}px`,
                                                    width: `${size}px`,
                                                    height: `${size}px`,
                                                    backgroundColor: `rgba(168, 85, 247, ${alpha})`
                                                }} 
                                                onClick={() => handleNodeClick(node)}>
                                                {node.name}
                                            </div>
                                        )
                                    })}
                                    {events.map((event) => {
                                        const isEventInFocus = focusedGroup ? event.groups.some(g => g.startsWith(focusedGroup)) : true;
                                        const pingSize = 24 + event.influence * 2;
                                        return <EventPing key={event.id} event={event} size={pingSize} className="universe-event-ping" isDimmed={focusedGroup !== null && !isEventInFocus}
                                            isHighlighted={isEventInFocus} onClick={setCommentModalTarget} onMouseEnter={setHoveredEvent} onMouseLeave={() => setHoveredEvent(null)} />
                                    })}
                                </div>
                            </div>
                        )}
                        {mode === GlobalizerMode.COUNTRY && (
                            <div className="country-view-container" onWheel={handleWheel}>
                                <div className="country-view-wrapper" style={{ transform: `scale(${zoom})` }}>
                                    {countryData.map(country => {
                                        const baseSize = 40;
                                        const size = baseSize + country.count * 15;
                                        const isSelected = selectedCountry === country.name;
                                        const isDimmed = selectedCountry && !isSelected;

                                        return (
                                        <div key={country.name}
                                            className={`country-bubble ${isSelected ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
                                            style={{ top: country.position.top, left: country.position.left, width: `${size}px`, height: `${size}px`, fontSize: `${10 + country.count}px` }}
                                            onClick={() => setSelectedCountry(prev => prev === country.name ? null : country.name)}
                                            onMouseEnter={() => setHoveredCountry(country)}
                                            onMouseLeave={() => setHoveredCountry(null)}>
                                            {country.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        );
                                    })}
                                    {selectedCountry && countryData.find(c => c.name === selectedCountry)?.events.map((event, i, arr) => {
                                        const country = countryData.find(c => c.name === selectedCountry)!;
                                        const angle = (i / arr.length) * 2 * Math.PI;
                                        const radius = (40 + country.count * 15) * 0.7; // 70% of the bubble radius
                                        const top = `calc(${country.position.top} + ${Math.sin(angle) * radius}px)`;
                                        const left = `calc(${country.position.left} + ${Math.cos(angle) * radius}px)`;
                                        return (
                                            <div key={event.id} className="local-event-ping" style={{ top, left }} onMouseEnter={() => setHoveredEvent(event)} onMouseLeave={() => setHoveredEvent(null)} onClick={() => setCommentModalTarget(event)}>
                                                <Icon name={getIconName(event.type)} className="w-3 h-3 text-white" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end gap-4">
                    {mode === GlobalizerMode.UNIVERSE && (
                        <div className="bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg flex-shrink-0">
                            <h5 className="font-bold text-white text-sm mb-2 text-left">My Bubbles</h5>
                            <div className="flex flex-col gap-1 items-start">
                                {myBubbles.map(bubble => {
                                    const masterGroup = bubble.split(':')[0];
                                    return <button key={bubble} onClick={() => {
                                            const targetNode = universeNodes.find(n => n.name === masterGroup);
                                            if (targetNode) handleNodeClick(targetNode);
                                        }}
                                        className={`text-xs text-left transition-colors w-full px-2 py-1 rounded ${focusedGroup === masterGroup ? 'bg-brand-accent text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                        {bubble}
                                    </button>
                                })}
                            </div>
                            {focusedGroup && <button onClick={() => {
                                setFocusedGroup(null);
                                setCameraTarget({ x: 0, y: 0, z: 0 });
                            }} className="text-xs text-gray-400 hover:text-white mt-2 w-full text-center">Reset View</button>}
                        </div>
                    )}
                    <div className="event-info-box bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg transition-all duration-300 flex-grow">
                        {hoveredEvent ? (
                            <div className="opacity-100 transition-opacity duration-300 text-left">
                                <h5 className="font-bold text-white">{hoveredEvent.title}</h5>
                                <p className="text-sm text-gray-300">{hoveredEvent.locationName}</p>
                                <p className="text-xs text-gray-400 mt-2">By {hoveredEvent.authorName}</p>
                                <Button size="sm" variant="secondary" className="mt-2" onClick={() => setCommentModalTarget(hoveredEvent)}>
                                    <Icon name="comment" className="w-4 h-4 mr-2" />
                                    View Comments
                                </Button>
                            </div>
                        ) : hoveredCountry ? (
                            <div className="opacity-100 transition-opacity duration-300 text-left">
                                <h5 className="font-bold text-white">{hoveredCountry.name}</h5>
                                <p className="text-sm text-gray-300">{hoveredCountry.count} active event{hoveredCountry.count > 1 ? 's' : ''}</p>
                            </div>
                        ) : (
                            <div className="opacity-70 transition-opacity duration-300">
                                <p className="text-sm text-gray-400 text-center">
                                    Hover over an item for details.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GlobalizerPanel;
