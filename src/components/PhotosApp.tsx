import React, { useState } from 'react';
import { 
    Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, 
    Download, Maximize2, ChevronLeft, ChevronRight,
    Sliders, Sun, Contrast, Eye, Sparkles, X, Plus
} from 'lucide-react';
import { sound } from '../utils/sound';

interface PhotosAppProps {
    onClose: () => void;
    theme?: 'windows' | 'mac';
    onSetWallpaper?: (url: string) => void;
}

const SAMPLE_PHOTOS = [
    {
        id: 'photo-1',
        title: 'Aurora Borealis Cyber',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        date: '2026-09-24',
        size: '2.4 MB'
    },
    {
        id: 'photo-2',
        title: 'Neon Tokyo Cityscape',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        date: '2026-09-23',
        size: '3.1 MB'
    },
    {
        id: 'photo-3',
        title: 'Retro Synthwave Grid',
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
        date: '2026-09-22',
        size: '1.9 MB'
    },
    {
        id: 'photo-4',
        title: 'Cyberpunk Alley Light',
        url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
        date: '2026-09-21',
        size: '4.2 MB'
    }
];

export const PhotosApp: React.FC<PhotosAppProps> = ({ onClose, theme = 'windows', onSetWallpaper }) => {
    const [photos, setPhotos] = useState(SAMPLE_PHOTOS);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia' | 'invert'>('none');
    const [isSlideshow, setIsSlideshow] = useState(false);

    const currentPhoto = photos[selectedIndex] || photos[0];

    const handlePrev = () => {
        sound.click();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
        setZoom(1);
        setRotation(0);
    };

    const handleNext = () => {
        sound.click();
        setSelectedIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
        setZoom(1);
        setRotation(0);
    };

    const getFilterCss = () => {
        switch (filter) {
            case 'grayscale': return 'grayscale(100%)';
            case 'sepia': return 'sepia(80%)';
            case 'invert': return 'invert(100%)';
            default: return 'none';
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
            {/* Toolbar */}
            <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-950 border border-pink-500/40 flex items-center justify-center text-pink-400">
                        <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-white">{currentPhoto.title}</div>
                        <div className="text-[10px] text-slate-400">{currentPhoto.date} • {currentPhoto.size}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="확대"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="축소"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setRotation(prev => (prev + 90) % 360)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="회전"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>

                    <div className="h-5 w-[1px] bg-slate-800 mx-1" />

                    {/* Filter buttons */}
                    {(['none', 'grayscale', 'sepia', 'invert'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => {
                                sound.click();
                                setFilter(f);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                filter === f 
                                    ? 'bg-pink-600 text-white shadow-sm' 
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            {f === 'none' ? '기본' : f}
                        </button>
                    ))}

                    <div className="h-5 w-[1px] bg-slate-800 mx-1" />

                    <a
                        href={currentPhoto.url}
                        download={`${currentPhoto.title}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="다운로드"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Main Viewer Area */}
            <div className="flex-1 bg-black/90 relative overflow-hidden flex items-center justify-center">
                <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center cursor-pointer transition-all shadow-xl"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center justify-center p-4 max-w-full max-h-full overflow-hidden transition-all duration-200">
                    <img
                        src={currentPhoto.url}
                        alt={currentPhoto.title}
                        style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            filter: getFilterCss()
                        }}
                        className="max-h-[70vh] max-w-[85vw] object-contain rounded-xl shadow-2xl transition-transform duration-200"
                    />
                </div>

                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center cursor-pointer transition-all shadow-xl"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Bottom Gallery Thumbnails */}
            <div className="h-20 px-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
                {photos.map((photo, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                        <div
                            key={photo.id}
                            onClick={() => {
                                sound.click();
                                setSelectedIndex(idx);
                                setZoom(1);
                                setRotation(0);
                            }}
                            className={`w-16 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all relative ${
                                isSelected ? 'border-pink-500 scale-105 shadow-md shadow-pink-900/40' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
