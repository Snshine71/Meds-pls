import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Toaster } from '@/components/ui/Toaster';
import { Hangar } from '@/pages/Hangar';
import { MissionPlan } from '@/pages/MissionPlan';
import { Settings } from '@/pages/Settings';
import { useSettingsStore } from '@/stores/settingsStore';

export default function App() {
  const load = useSettingsStore((s) => s.load);

  // Hydrate settings (theme, API key, overrides) from Dexie on boot.
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Hangar />} />
          <Route path="/project/:projectId" element={<MissionPlan />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </BrowserRouter>
  );
}
