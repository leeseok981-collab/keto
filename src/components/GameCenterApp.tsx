import React, { useState, useEffect } from 'react';
import { 
    Gamepad2, Search, Play, Trophy, Clock, Zap, Settings, Award, 
    Sparkles, Shield, Download, Trash2, Sliders, Volume2, RefreshCw, 
    BarChart2, Star, CheckCircle2, AlertTriangle, Key, Layers, ArrowUpRight 
} from 'lucide-react';
import { GAME_CATALOG, GameInfo } from '../data/gameCatalog';
import { GameAPI, GameStats, Achievement, UserGameProfile, CommonGameSettings, KeyBindings } from '../services/gameApi';
import { appRegistry } from '../services/appRegistry';
import { gameAudio } from '../services/gameAudio';

interface GameCenterAppProps {
    onClose?: () => void;
    onLaunchGame: (appType: string) => void;
    onOpenCatoreGameStore?: () => void;
}

export const GameCenterApp: React.FC<GameCenterAppProps> = ({
    onClose,
    onLaunchGame,
    onOpenCatoreGameStore
}) => {
    const [activeTab, setActiveTab] = useState<'home' | 'library' | 'achievements' | 'stats' | 'settings'>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [userProfile, setUserProfile] = useState<UserGameProfile>(() => GameAPI.getUserProfile());
    const [commonSettings, setCommonSettings] = useState<CommonGameSettings>(() => GameAPI.getCommonSettings());
    const [gameStatsMap, setGameStatsMap] = useState<Record<string, GameStats>>({});
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [installedAppTypes, setInstalledAppTypes] = useState<string[]>([]);
    const [selectedGameKeyRemap, setSelectedGameKeyRemap] = useState<string>('speedkeyboard');
    const [keyBindings, setKeyBindings] = useState<KeyBindings>({});

    const loadCenterData = async () => {
        setUserProfile(GameAPI.getUserProfile());
        setCommonSettings(GameAPI.getCommonSettings());

        // Get installed games from Catore app registry
        const installedPkgs = appRegistry.getInstalledAppPackages();
        const installedTypes = installedPkgs.map(p => p.appType || '').filter(Boolean);
        setInstalledAppTypes(installedTypes);

        // Load stats for all games in catalog
        const statsObj: Record<string, GameStats> = {};
        for (const g of GAME_CATALOG) {
            statsObj[g.appType] = await GameAPI.getGameStats(g.appType);
        }
        setGameStatsMap(statsObj);

        // Load achievements
        const achs = await GameAPI.getAchievements();
        setAchievements(achs);

        // Load default keybindings
        const curGame = GAME_CATALOG.find(g => g.appType === selectedGameKeyRemap);
        if (curGame) {
            const defaultMap: Record<string, string> = {};
            curGame.controlsGuide.forEach(c => { defaultMap[c.action] = c.key; });
            setKeyBindings(GameAPI.getKeyBindings(curGame.appType, defaultMap));
        }
    };

    useEffect(() => {
        loadCenterData();

        const handleUpdate = () => loadCenterData();
        window.addEventListener('game-center-updated', handleUpdate);
        window.addEventListener('catchos-app-installed', handleUpdate);
        window.addEventListener('catchos-app-uninstalled', handleUpdate);

        return () => {
            window.removeEventListener('game-center-updated', handleUpdate);
            window.removeEventListener('catchos-app-installed', handleUpdate);
            window.removeEventListener('catchos-app-uninstalled', handleUpdate);
        };
    }, [selectedGameKeyRemap]);

    const isInstalled = (appType: string) => installedAppTypes.includes(appType);

    const handleInstallGame = (pkgId: string) => {
        gameAudio.buy();
        appRegistry.install(pkgId);
        loadCenterData();
    };

    const handleUninstallGame = (game: GameInfo) => {
        gameAudio.click();
        if (confirm(`'${game.name}' 게임을 삭제하시겠습니까?\n세이브 데이터는 보존되며 필요 시 개별 리셋할 수 있습니다.`)) {
            appRegistry.uninstall(game.pkgId);
            loadCenterData();
        }
    };

    const handleSaveKeyBinding = (action: string, newKey: string) => {
        const updated = { ...keyBindings, [action]: newKey };
        setKeyBindings(updated);
        GameAPI.saveKeyBindings(selectedGameKeyRemap, updated);
        gameAudio.click();
    };

    const handleUpdateSettings = (key: keyof CommonGameSettings, value: any) => {
        const updated = { ...commonSettings, [key]: value };
        setCommonSettings(updated);
        GameAPI.saveCommonSettings(updated);
        gameAudio.click();
    };

    // Filter games by search
    const filteredGames = GAME_CATALOG.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Recently played games sorted by lastPlayedAt
    const recentlyPlayed = [...GAME_CATALOG]
        .filter(g => isInstalled(g.appType))
        .sort((a, b) => {
            const timeA = gameStatsMap[a.appType]?.lastPlayedAt || 0;
            const timeB = gameStatsMap[b.appType]?.lastPlayedAt || 0;
            return timeB - timeA;
        });

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
            {/* Game Center Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/40 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg border border-cyan-300/40 shrink-0">
                        <Gamepad2 className="w-7 h-7 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
                            <span>🎮 GAME CENTER</span>
                            <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                                HUB
                            </span>
                        </h1>
                        <p className="text-xs text-indigo-200/80">
                            가상 OS 게이밍 플랫폼 — 라이브러리, 통합 업적 & 플레이 통계
                        </p>
                    </div>
                </div>

                {/* User Profile Progress & Virtual Currency */}
                <div className="flex items-center gap-4 bg-slate-900/80 p-2.5 rounded-2xl border border-indigo-900/50 shadow-inner">
                    <div className="text-right">
                        <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                            <span className="text-amber-400 font-black">Lv.{userProfile.level}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({userProfile.xp} XP)</span>
                        </div>
                        <div className="w-28 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-1">
                            <div
                                className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all"
                                style={{ width: `${Math.min(100, (userProfile.xp % 1000) / 10)}%` }}
                            />
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-800" />

                    <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-950/60 border border-yellow-500/40 rounded-xl text-yellow-300 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span>{userProfile.virtualCoins.toLocaleString()} $G</span>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'home', label: '🎮 최근 플레이 & 추천', icon: Play },
                        { id: 'library', label: '📚 라이브러리', icon: Layers },
                        { id: 'achievements', label: '🏆 업적', icon: Trophy },
                        { id: 'stats', label: '📊 플레이 기록', icon: BarChart2 },
                        { id: 'settings', label: '⚙️ 게임 설정', icon: Settings }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    gameAudio.click();
                                    setActiveTab(tab.id as any);
                                }}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                    isActive
                                        ? 'bg-cyan-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <div className="relative hidden md:block w-48 shrink-0">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="게임 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                {/* 1. HOME TAB */}
                {activeTab === 'home' && (
                    <div className="space-y-6">
                        {/* Recently Played Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-cyan-400" /> 최근 플레이한 게임
                                </h2>
                                {onOpenCatoreGameStore && (
                                    <button
                                        onClick={onOpenCatoreGameStore}
                                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        캐토어 스토어 둘러보기 <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {recentlyPlayed.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                                    <Gamepad2 className="w-8 h-8 mx-auto opacity-40 text-cyan-400" />
                                    <p className="text-xs">아직 설치된 게임이 없습니다. 라이브러리에서 게임을 설치하세요!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recentlyPlayed.slice(0, 3).map(game => {
                                        const stats = gameStatsMap[game.appType];
                                        return (
                                            <div
                                                key={game.id}
                                                className={`p-4 rounded-2xl bg-gradient-to-br ${game.bannerGradient} border border-white/20 shadow-xl flex flex-col justify-between space-y-4 relative group`}
                                            >
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-cyan-300 bg-black/40 px-2 py-0.5 rounded-md">
                                                        {game.genre}
                                                    </span>
                                                    <h3 className="text-lg font-black text-white drop-shadow">{game.name}</h3>
                                                    <p className="text-xs text-slate-200/80 line-clamp-2">{game.description}</p>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono">
                                                    <div>
                                                        <span className="text-slate-300 block text-[9px]">최고 기록</span>
                                                        <span className="text-amber-300 font-bold">{(stats?.bestScore || 0).toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => onLaunchGame(game.appType)}
                                                        className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                                                        <span>▶ 플레이</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* All Games Recommendation Grid */}
                        <div className="space-y-3">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" /> 추천 게임 전체 목록
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {filteredGames.map(game => {
                                    const installed = isInstalled(game.appType);
                                    const stats = gameStatsMap[game.appType];
                                    return (
                                        <div
                                            key={game.id}
                                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                                        {game.genre}
                                                    </span>
                                                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                                        <Star className="w-3 h-3 fill-amber-400" /> {game.rating}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold text-white">{game.name}</h4>
                                                <p className="text-[11px] text-slate-400 line-clamp-2">{game.description}</p>
                                            </div>

                                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] mt-3">
                                                <span className="text-slate-500 font-mono">{game.size}</span>
                                                {installed ? (
                                                    <button
                                                        onClick={() => onLaunchGame(game.appType)}
                                                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs shadow cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Play className="w-3 h-3 fill-white" /> 실행
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleInstallGame(game.pkgId)}
                                                        className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white border border-slate-700 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Download className="w-3 h-3" /> 설치
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. LIBRARY TAB */}
                {activeTab === 'library' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-cyan-400" /> 전체 라이브러리 카드 ({GAME_CATALOG.length}개)
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredGames.map(game => {
                                const installed = isInstalled(game.appType);
                                const stats = gameStatsMap[game.appType];
                                return (
                                    <div
                                        key={game.id}
                                        className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between space-y-4 relative group"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                                        {game.genre}
                                                    </span>
                                                    <h3 className="text-base font-bold text-white mt-1">{game.name}</h3>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                                                    v{game.version}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-300 leading-relaxed">{game.description}</p>

                                            {/* Play Stats Summary */}
                                            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                                                <div>
                                                    <span className="text-slate-500 block text-[9px]">최고 기록</span>
                                                    <span className="text-amber-400 font-bold">{(stats?.bestScore || 0).toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 block text-[9px]">총 플레이 시간</span>
                                                    <span className="text-cyan-400 font-bold">{Math.floor((stats?.totalPlayTime || 0) / 60)}분</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                            {installed ? (
                                                <>
                                                    <button
                                                        onClick={() => onLaunchGame(game.appType)}
                                                        className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer flex items-center justify-center gap-1.5"
                                                    >
                                                        <Play className="w-3.5 h-3.5 fill-white" />
                                                        <span>플레이</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleUninstallGame(game)}
                                                        title="게임 삭제"
                                                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleInstallGame(game.pkgId)}
                                                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer flex items-center justify-center gap-1.5"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>게임 설치 ({game.size})</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. ACHIEVEMENTS TAB */}
                {activeTab === 'achievements' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-400" /> 통합 가상 게임 업적
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {achievements.map(ach => (
                                <div
                                    key={ach.id}
                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                        ach.unlocked
                                            ? 'bg-amber-950/30 border-amber-500/50 shadow-lg'
                                            : 'bg-slate-900/60 border-slate-800 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow shrink-0 ${
                                            ach.unlocked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
                                        }`}>
                                            {ach.icon || '🏆'}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <span>{ach.title}</span>
                                                {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{ach.description}</div>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0 text-[10px] font-mono">
                                        <div className="text-cyan-400 font-bold">+{ach.xpReward} XP</div>
                                        <div className="text-amber-400 font-bold">+{ach.coinReward} $G</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. STATS TAB */}
                {activeTab === 'stats' && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-cyan-400" /> 누적 플레이 통계
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {GAME_CATALOG.map(game => {
                                const stats = gameStatsMap[game.appType];
                                return (
                                    <div key={game.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                                        <div className="text-xs font-bold text-white">{game.name}</div>
                                        <div className="text-[11px] font-mono text-slate-400 space-y-1">
                                            <div>최고 점수: <span className="text-amber-400 font-bold">{(stats?.bestScore || 0).toLocaleString()}</span></div>
                                            <div>총 플레이 시간: <span className="text-cyan-400">{Math.floor((stats?.totalPlayTime || 0) / 60)}분</span></div>
                                            <div>실행 횟수: <span className="text-purple-400">{stats?.playCount || 0}회</span></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 5. SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <Settings className="w-4 h-4 text-cyan-400" /> 공통 오디오 및 조작키 설정
                        </h2>

                        {/* Volume Sliders */}
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                                <Volume2 className="w-4 h-4" /> 사운드 및 볼륨
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-300">마스터 볼륨:</span>
                                        <span className="text-cyan-400 font-mono font-bold">{Math.round(commonSettings.masterVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={commonSettings.masterVolume}
                                        onChange={(e) => handleUpdateSettings('masterVolume', parseFloat(e.target.value))}
                                        className="w-full accent-cyan-400 cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-300">BGM 음량:</span>
                                        <span className="text-purple-400 font-mono font-bold">{Math.round(commonSettings.bgmVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={commonSettings.bgmVolume}
                                        onChange={(e) => handleUpdateSettings('bgmVolume', parseFloat(e.target.value))}
                                        className="w-full accent-purple-400 cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-300">효과음(SFX) 음량:</span>
                                        <span className="text-amber-400 font-mono font-bold">{Math.round(commonSettings.sfxVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={commonSettings.sfxVolume}
                                        onChange={(e) => handleUpdateSettings('sfxVolume', parseFloat(e.target.value))}
                                        className="w-full accent-amber-400 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Controls Keybinding Customizer */}
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                                    <Key className="w-4 h-4" /> 키 커스텀 커스텀 리매핑
                                </h3>
                                <select
                                    value={selectedGameKeyRemap}
                                    onChange={(e) => setSelectedGameKeyRemap(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-xs text-white px-2.5 py-1 rounded-xl"
                                >
                                    {GAME_CATALOG.map(g => (
                                        <option key={g.id} value={g.appType}>{g.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                {Object.entries(keyBindings).map(([action, key]) => (
                                    <div key={action} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                                        <span className="text-slate-300 font-medium">{action}</span>
                                        <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-lg font-mono font-bold">
                                            {key}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
