import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserIcon, AtSymbolIcon } from '../common/Icons';
import { generateAvatar } from '../../services/geminiService';

const CustomContextMenu: React.FC<{
    position: { x: number, y: number };
    onSelect: (option: 'upload' | 'photo' | 'generate') => void;
    onClose: () => void;
}> = ({ position, onSelect, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    
    return (
        <div
            ref={menuRef}
            className="absolute z-50 w-48 bg-gray-800 border border-cyan-500/30 rounded-md shadow-lg shadow-cyan-500/10 animate-[fadeIn_0.1s_ease-out]"
            style={{ top: position.y, left: position.x }}
        >
            <ul className="py-1 text-sm text-gray-200">
                <li onClick={() => onSelect('upload')} className="px-4 py-2 hover:bg-cyan-700/50 cursor-pointer">Upload Image</li>
                <li onClick={() => onSelect('photo')} className="px-4 py-2 hover:bg-cyan-700/50 cursor-pointer">Take Photo</li>
                <li onClick={() => onSelect('generate')} className="px-4 py-2 hover:bg-cyan-700/50 cursor-pointer">Generate with AI</li>
            </ul>
        </div>
    );
};

const CameraModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageDataUrl: string) => void;
}> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(s => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => console.error("Error accessing camera:", err));
        }
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [isOpen]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context?.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            onCapture(dataUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-gray-900 border border-cyan-500/30 p-6 rounded-lg shadow-lg">
                <video ref={videoRef} autoPlay playsInline className="rounded-md w-full max-w-lg"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={handleCapture} className="font-orbitron bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg">Capture</button>
                    <button onClick={onClose} className="font-orbitron bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const GenerateAvatarModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (imageDataUrl: string) => void;
}> = ({ isOpen, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('a hybrid cyborg, half human half machine, with glowing blue optics, in a futuristic city');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        const result = await generateAvatar(prompt);
        setIsLoading(false);
        if (result) {
            onGenerate(result);
            onClose();
        } else {
            setError('Failed to generate image. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-gray-900 border border-cyan-500/30 p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h3 className="font-orbitron text-xl text-cyan-300 mb-4">Generate Avatar with AI</h3>
                <p className="text-gray-400 mb-4 text-sm">Describe your desired avatar. Be as creative as you like!</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                <div className="flex justify-end gap-4 mt-4">
                     <button onClick={onClose} disabled={isLoading} className="font-orbitron bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                    <button onClick={handleGenerate} disabled={isLoading} className="font-orbitron bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-bold py-2 px-6 rounded-lg flex items-center">
                        {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const ProfileConfigPage: React.FC<{ user: { fullName: string }, onProfileComplete: (profile: any) => void }> = ({ user, onProfileComplete }) => {
    const [displayName, setDisplayName] = useState(user.fullName);
    const [handle, setHandle] = useState(user.fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    const [bio, setBio] = useState('');
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number }>({ visible: false, x: 0, y: 0 });
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onProfileComplete({ displayName, handle, bio, avatarSrc });
    };

    const handleAvatarRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
    };

    const handleContextMenuSelect = (option: 'upload' | 'photo' | 'generate') => {
        setContextMenu({ visible: false, x: 0, y: 0 });
        if (option === 'upload') {
            fileInputRef.current?.click();
        } else if (option === 'photo') {
            setIsCameraModalOpen(true);
        } else if (option === 'generate') {
            setIsGenerateModalOpen(true);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarSrc(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleCapture = (imageDataUrl: string) => {
        setAvatarSrc(imageDataUrl);
    };

    return (
        <>
            <main className="relative flex items-center justify-center min-h-screen w-full bg-gray-900 text-gray-200 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2&random=3')" }}></div>
                <div className="absolute inset-0 bg-black/70 z-10"></div>
                <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/20 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
                <div className="relative z-20 flex flex-col w-full max-w-4xl p-8 m-4 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10">
                    <div className="text-center mb-6"><h1 className="font-orbitron text-3xl font-bold text-cyan-300 tracking-widest uppercase">Configure Your Profile</h1><p className="text-gray-400 mt-2">Create your public identity for the Portal Universe.</p></div>
                    <div className="my-4 p-4 text-center bg-green-500/10 border border-green-400/30 rounded-lg"><p className="font-orbitron text-lg text-green-300">Survey Complete! <span className="font-bold text-white">+1000XP</span> Awarded.</p><a href="#" className="text-sm text-green-400 hover:text-green-200 transition-colors">Spend at Portal Store &raquo;</a></div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                        <div className="md:col-span-1 flex flex-col items-center">
                            <div
                                onContextMenu={handleAvatarRightClick}
                                className="w-40 h-40 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600 mb-4 cursor-pointer hover:border-cyan-500 transition-colors"
                            >
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Avatar Preview" className="w-full h-full rounded-full object-cover"/>
                                ) : (
                                    <span className="text-gray-500 text-sm text-center p-2">Right-click for options</span>
                                )}
                                
                            </div>
                            <p className="text-xs text-gray-500">Right-click avatar to change</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="relative"><label className="font-orbitron text-sm text-cyan-200 mb-2 block">Display Name</label><span className="absolute left-3 bottom-3.5"><UserIcon /></span><input type="text" placeholder="Your Public Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"/></div>
                            <div className="relative"><label className="font-orbitron text-sm text-cyan-200 mb-2 block">Handle</label><span className="absolute left-3 bottom-3.5"><AtSymbolIcon /></span><input type="text" placeholder="your-unique-handle" value={handle} onChange={(e) => setHandle(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"/></div>
                            <div><label className="font-orbitron text-sm text-cyan-200 mb-2 block">Bio / Tagline</label><textarea placeholder="A short description of yourself..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"/></div>
                            <button type="submit" className="font-orbitron w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105">Confirm & Enter Portal</button>
                        </div>
                    </form>
                </div>
            </main>
            {contextMenu.visible && <CustomContextMenu position={{ x: contextMenu.x, y: contextMenu.y }} onSelect={handleContextMenuSelect} onClose={() => setContextMenu({ ...contextMenu, visible: false })} />}
            <CameraModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} onCapture={handleCapture} />
            <GenerateAvatarModal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} onGenerate={handleCapture} />
        </>
    );
};

export default ProfileConfigPage;
