const DEFAULT_SETTINGS = {
  visibilityScope: 'Admin + Members',
  transparency: 0.92,
  weeklyReportVisible: true,
};

export const getSettings = () => {
  const stored = localStorage.getItem('adminSettings');
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  localStorage.setItem('adminSettings', JSON.stringify(settings));
  window.dispatchEvent(new Event('settings:updated'));
};

export const SETTINGS_DEFAULTS = DEFAULT_SETTINGS;
