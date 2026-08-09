import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { WorkoutTimerScreen } from './components/WorkoutTimerScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { HistoryScreen, initialHistoryItems } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CustomWorkoutModal } from './components/CustomWorkoutModal';
import { AuthModal } from './components/AuthModal';
import { SideMenuDrawer, ProfileDrawer } from './components/Drawers';
import { WorkoutPreset, WorkoutHistoryItem, UserProfile, UserSettings } from './types';
import { api, removeAuthToken, getAuthToken } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activePreset, setActivePreset] = useState<WorkoutPreset | null>(null);

  // Persistence: User Profile State
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('pulse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return null;
  });

  // Persistence: User Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('pulse_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return {
      soundEnabled: true,
      volume: 0.6,
      defaultPrepSeconds: 10,
      defaultSetRestSeconds: 60,
      accentTheme: 'LIME',
      glassmorphismEnabled: true,
      weeklyGoal: 5,
    };
  });

  // Persistence: History Items
  const [historyItems, setHistoryItems] = useState<WorkoutHistoryItem[]>(() => {
    const saved = localStorage.getItem('pulse_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return initialHistoryItems;
  });

  // Persistence: Custom Workout Presets Saved by User
  const [customPresets, setCustomPresets] = useState<WorkoutPreset[]>(() => {
    const saved = localStorage.getItem('pulse_custom_presets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return [];
  });

  // Modals & Drawers state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Sync with API when user logs in or page loads
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe().then((res) => {
        if (res && res.user) {
          setUser(res.user);
        }
      }).catch(() => {
        // Token invalid or offline
      });
    }
  }, []);

  useEffect(() => {
    if (user && user.isLoggedIn) {
      api.getHistory().then((items) => {
        if (Array.isArray(items)) setHistoryItems(items);
      });
      api.getPresets().then((presets) => {
        if (Array.isArray(presets)) setCustomPresets(presets);
      });
      api.getSettings().then((dbSettings) => {
        if (dbSettings) setSettings((prev) => ({ ...prev, ...dbSettings }));
      });
    }
  }, [user]);

  // Sync to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('pulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pulse_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pulse_settings', JSON.stringify(settings));
    
    // Dynamically apply Light/Dark mode
    const root = document.documentElement;
    const isLight = settings.themeMode === 'light';
    if (isLight) {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }

    // Dynamically apply Theme Accent Colors to Document Root CSS Variables
    switch (settings.accentTheme) {
      case 'CYAN':
        root.style.setProperty('--accent-color', '#00f0ff');
        root.style.setProperty('--accent-dark', '#002228');
        root.style.setProperty('--accent-text-color', isLight ? '#0284c7' : '#00f0ff');
        root.style.setProperty('--accent-glow', isLight ? 'rgba(0, 150, 200, 0.25)' : 'rgba(0, 240, 255, 0.4)');
        root.style.setProperty('--accent-glow-subtle', 'rgba(0, 240, 255, 0.15)');
        break;
      case 'ORANGE':
        root.style.setProperty('--accent-color', '#ff6b00');
        root.style.setProperty('--accent-dark', '#280a00');
        root.style.setProperty('--accent-text-color', isLight ? '#c2410c' : '#ff6b00');
        root.style.setProperty('--accent-glow', isLight ? 'rgba(255, 107, 0, 0.25)' : 'rgba(255, 107, 0, 0.4)');
        root.style.setProperty('--accent-glow-subtle', 'rgba(255, 107, 0, 0.15)');
        break;
      case 'RED':
        root.style.setProperty('--accent-color', '#ff3b30');
        root.style.setProperty('--accent-dark', '#280805');
        root.style.setProperty('--accent-text-color', isLight ? '#dc2626' : '#ff3b30');
        root.style.setProperty('--accent-glow', isLight ? 'rgba(255, 59, 48, 0.25)' : 'rgba(255, 59, 48, 0.4)');
        root.style.setProperty('--accent-glow-subtle', 'rgba(255, 59, 48, 0.15)');
        break;
      case 'LIME':
      default:
        root.style.setProperty('--accent-color', '#d2f000');
        root.style.setProperty('--accent-dark', '#191e00');
        root.style.setProperty('--accent-text-color', isLight ? '#3f6212' : '#d2f000');
        root.style.setProperty('--accent-glow', isLight ? 'rgba(80, 120, 0, 0.25)' : 'rgba(210, 240, 0, 0.4)');
        root.style.setProperty('--accent-glow-subtle', 'rgba(210, 240, 0, 0.15)');
        break;
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pulse_history', JSON.stringify(historyItems));
  }, [historyItems]);

  useEffect(() => {
    localStorage.setItem('pulse_custom_presets', JSON.stringify(customPresets));
  }, [customPresets]);

  const handleSaveCustomPreset = (newPreset: WorkoutPreset) => {
    setCustomPresets((prev) => [newPreset, ...prev]);
    api.addPreset(newPreset);
  };

  const handleDeleteCustomPreset = (id: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
    api.deletePreset(id);
  };

  const handleUpdateSettings = (updated: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
    api.saveSettings(updated);
    if (updated.weeklyGoal) {
      setUser((prev) => (prev ? { ...prev, weeklyGoal: updated.weeklyGoal } : null));
    }
  };

  const handleStartWorkout = (preset: WorkoutPreset) => {
    setActivePreset(preset);
  };

  const handleFinishWorkout = (newItem: WorkoutHistoryItem) => {
    setHistoryItems((prev) => [newItem, ...prev]);
    api.addHistory(newItem);
    setActivePreset(null);
    setActiveTab('history');
  };

  const handleCancelWorkout = () => {
    setActivePreset(null);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    api.deleteHistoryItem(id);
  };

  const handleAddManualWorkout = (newItem: WorkoutHistoryItem) => {
    setHistoryItems((prev) => [newItem, ...prev]);
    api.addHistory(newItem);
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    api.clearHistory();
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setIsProfileOpen(false);
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
  };

  // Header Title
  const getHeaderTitle = () => 'PULSE & PRECISION';

  return (
    <div className={`min-h-screen bg-[#131313] text-[#e5e2e1] font-['Inter'] flex flex-col justify-between selection:bg-[#d2f000] selection:text-[#191e00] relative overflow-x-hidden ${settings.glassmorphismEnabled !== false ? 'glassmorphism-enabled' : ''} ${settings.themeMode === 'light' ? 'light-theme' : ''}`}>
      {/* Ambient background light orbs for glassmorphism visual refraction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-accent/15 blur-[100px]" />
        <div className="absolute top-[35%] left-[-15%] w-[320px] h-[320px] rounded-full bg-[#ffb4aa]/10 blur-[110px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* MANDATORY AUTH GATING: If user is logged out, prompt login */}
      {!user || !user.isLoggedIn ? (
        <AuthModal
          isOpen={true}
          isMandatory={true}
          onClose={() => {}}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : activePreset ? (
        /* ACTIVE WORKOUT TIMER OVERLAY SCREEN */
        <WorkoutTimerScreen
          preset={activePreset}
          onFinishWorkout={handleFinishWorkout}
          onCancel={handleCancelWorkout}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        />
      ) : (
        <>
          {/* HEADER */}
          <Header
            title={getHeaderTitle()}
            user={user}
            onOpenMenu={() => setIsSideMenuOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenLogin={() => setIsAuthModalOpen(true)}
          />

          {/* MAIN SCREEN TAB CONTENT */}
          <div className="flex-1 w-full max-w-[600px] mx-auto">
            {activeTab === 'home' && (
              <HomeScreen
                onStartWorkout={handleStartWorkout}
                onOpenCustomBuilder={() => setShowCustomModal(true)}
                lastSession={historyItems[0]}
                onViewHistory={() => setActiveTab('history')}
                customPresets={customPresets}
                onDeleteCustomPreset={handleDeleteCustomPreset}
                weeklyGoal={user?.weeklyGoal || settings.weeklyGoal || 5}
                historyItems={historyItems}
              />
            )}

            {activeTab === 'history' && (
              <HistoryScreen
                historyItems={historyItems}
                onStartWorkout={handleStartWorkout}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onAddManualWorkout={handleAddManualWorkout}
              />
            )}

            {activeTab === 'analytics' && <AnalyticsScreen historyItems={historyItems} />}

            {activeTab === 'settings' && (
              <SettingsScreen
                user={user}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onLogout={handleLogout}
                onClearHistory={handleClearHistory}
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>

          {/* BOTTOM NAVBAR */}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* DRAWERS & MODALS */}
          <SideMenuDrawer
            isOpen={isSideMenuOpen}
            onClose={() => setIsSideMenuOpen(false)}
            onStartPreset={handleStartWorkout}
            onNavigate={(tab) => setActiveTab(tab)}
          />

          <ProfileDrawer
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            historyItems={historyItems}
            onLogout={handleLogout}
            onOpenLogin={() => setIsAuthModalOpen(true)}
            onUpdateUser={(updated) => setUser(updated)}
          />

          <AuthModal
            isOpen={isAuthModalOpen}
            isMandatory={false}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />

          {showCustomModal && (
            <CustomWorkoutModal
              onClose={() => setShowCustomModal(false)}
              onSaveCustomPreset={handleSaveCustomPreset}
              onStartCustomWorkout={(preset) => {
                setShowCustomModal(false);
                handleStartWorkout(preset);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

