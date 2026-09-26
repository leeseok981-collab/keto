import React, { useState, useEffect } from 'react';
import { CanvasAppView, CanvasUser } from '../../types/canvasApp';
import { CanvasProject, CanvasTemplate } from '../../types/catvas';
import { canvasAuthService } from '../../services/canvasAuthService';
import { canvasStorageService } from '../../services/canvasStorageService';
import { CanvasLoginScreen } from './CanvasLoginScreen';
import { CanvasHeader } from './CanvasHeader';
import { CanvasSidebar } from './CanvasSidebar';
import { CanvasHome } from './CanvasHome';
import { CanvasProjectsPage } from './CanvasProjectsPage';
import { CanvasTemplatesPage } from './CanvasTemplatesPage';
import { CanvasProfilePage } from './CanvasProfilePage';
import { CanvasSettingsPage } from './CanvasSettingsPage';
import { CanvasMultiJoinPage } from './CanvasMultiJoinPage';
import { CanvasPluginsPage } from './CanvasPluginsPage';
import { CanvasNewDesignModal } from './CanvasNewDesignModal';
import { CatvasEditor } from '../CatvasEditor';
import { sound } from '../../utils/sound';

interface CanvasAppProps {
    onClose: () => void;
    onSaveToDesktop?: (name: string, content: string | Blob, fileUrl?: string, type?: string) => void;
    isProSubscribed?: boolean;
    onOpenProModal?: (noticeMsg?: string) => void;
}

export const CanvasApp: React.FC<CanvasAppProps> = ({
    onClose,
    onSaveToDesktop,
    isProSubscribed = false,
    onOpenProModal
}) => {
    const [user, setUser] = useState<CanvasUser | null>(() => canvasAuthService.getUser());
    const [currentView, setCurrentView] = useState<CanvasAppView>(() => {
        return canvasAuthService.isLoggedIn() ? 'CANVAS_HOME' : 'CANVAS_LOGIN';
    });
    const [activeProject, setActiveProject] = useState<CanvasProject | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isNewDesignModalOpen, setIsNewDesignModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = canvasAuthService.subscribe((u) => {
            setUser(u);
            if (!u) {
                setCurrentView('CANVAS_LOGIN');
            }
        });
        return unsubscribe;
    }, []);

    // Set page title
    useEffect(() => {
        const prevTitle = document.title;
        document.title = 'CANVAS — 디자인 & 영상 스튜디오';
        return () => {
            document.title = prevTitle;
        };
    }, []);

    // Handlers
    const handleLoginSuccess = (loggedInUser: CanvasUser) => {
        setUser(loggedInUser);
        setCurrentView('CANVAS_HOME');
    };

    const handleLogout = () => {
        canvasAuthService.logout();
        setCurrentView('CANVAS_LOGIN');
    };

    const handleOpenProject = (project: CanvasProject) => {
        setActiveProject(project);
        setCurrentView('CANVAS_EDITOR');
    };

    const handleCreateProject = (preset: { title: string; width: number; height: number; ratio?: string }) => {
        const newProj = canvasStorageService.createNewProject(preset);
        setActiveProject(newProj);
        setCurrentView('CANVAS_EDITOR');
    };

    const handleUseTemplate = (template: CanvasTemplate) => {
        const newProj = canvasStorageService.createProjectFromTemplate(template);
        setActiveProject(newProj);
        setCurrentView('CANVAS_EDITOR');
    };

    const handleDirectNewCanvas = () => {
        handleCreateProject({
            title: '새 그래픽 디자인',
            width: 1920,
            height: 1080,
            ratio: '16:9'
        });
    };

    const handleDirectNewVideo = () => {
        handleCreateProject({
            title: '새 비디오 타임라인 프로젝트',
            width: 1920,
            height: 1080,
            ratio: '16:9'
        });
    };

    // If in Editor mode, render full CatvasEditor without OS bars
    if (currentView === 'CANVAS_EDITOR') {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-950 text-white animate-fade-in flex flex-col overflow-hidden">
                <CatvasEditor
                    initialProject={activeProject}
                    onClose={() => {
                        sound.click();
                        setCurrentView('CANVAS_HOME');
                        setActiveProject(null);
                    }}
                    onCloseEditor={() => {
                        sound.click();
                        setCurrentView('CANVAS_HOME');
                        setActiveProject(null);
                    }}
                    onSaveToDesktop={onSaveToDesktop}
                    user={user}
                    onLogin={() => setCurrentView('CANVAS_LOGIN')}
                    isProSubscribed={isProSubscribed}
                    onOpenProModal={onOpenProModal}
                />
            </div>
        );
    }

    // If not logged in, render Login Screen
    if (currentView === 'CANVAS_LOGIN' || !user) {
        return (
            <CanvasLoginScreen
                onLoginSuccess={handleLoginSuccess}
                onBackToWindows={onClose}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-slate-950 text-white select-none font-sans">
            {/* Top Navigation Header */}
            <CanvasHeader
                user={user}
                onOpenNewDesignModal={() => setIsNewDesignModalOpen(true)}
                onNavigate={setCurrentView}
                onLogout={handleLogout}
                onBackToWindows={onClose}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {/* Main Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Navigation Sidebar */}
                <CanvasSidebar
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    onDirectNewCanvas={handleDirectNewCanvas}
                    onDirectNewVideo={handleDirectNewVideo}
                    onBackToWindows={onClose}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                    {currentView === 'CANVAS_HOME' && (
                        <CanvasHome
                            user={user}
                            onOpenProject={handleOpenProject}
                            onOpenNewDesignModal={() => setIsNewDesignModalOpen(true)}
                            onUseTemplate={handleUseTemplate}
                            onNavigate={setCurrentView}
                        />
                    )}

                    {currentView === 'CANVAS_PROJECTS' && (
                        <CanvasProjectsPage
                            onOpenProject={handleOpenProject}
                            onOpenNewDesignModal={() => setIsNewDesignModalOpen(true)}
                        />
                    )}

                    {currentView === 'CANVAS_TEMPLATES' && (
                        <CanvasTemplatesPage
                            onUseTemplate={handleUseTemplate}
                        />
                    )}

                    {currentView === 'CANVAS_PROFILE' && (
                        <CanvasProfilePage
                            user={user}
                            onLogout={handleLogout}
                            onUserUpdated={setUser}
                        />
                    )}

                    {currentView === 'CANVAS_SETTINGS' && (
                        <CanvasSettingsPage />
                    )}

                    {currentView === 'CANVAS_MULTI' && (
                        <CanvasMultiJoinPage
                            userName={user?.name || ''}
                            onJoinSuccess={(roomCode, project) => {
                                handleOpenProject(project);
                            }}
                        />
                    )}

                    {currentView === 'CANVAS_PLUGINS' && (
                        <CanvasPluginsPage
                            onOpenEditor={handleDirectNewCanvas}
                            onLaunchPluginInEditor={(pluginId) => {
                                handleDirectNewCanvas();
                            }}
                        />
                    )}
                </main>
            </div>

            {/* New Design Preset Modal */}
            <CanvasNewDesignModal
                isOpen={isNewDesignModalOpen}
                onClose={() => setIsNewDesignModalOpen(false)}
                onCreateProject={handleCreateProject}
            />
        </div>
    );
};
