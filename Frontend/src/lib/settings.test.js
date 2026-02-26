import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as settings from './settings';

describe('Settings Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should have correct default values', () => {
      expect(settings.DEFAULT_SETTINGS).toEqual({
        visibilityScope: 'Admin + Members',
        transparency: 0.92,
        weeklyReportVisible: true,
      });
    });

    it('should have SETTINGS_DEFAULTS equal to DEFAULT_SETTINGS', () => {
      expect(settings.SETTINGS_DEFAULTS).toEqual(settings.DEFAULT_SETTINGS);
    });
  });

  describe('getSettings', () => {
    it('should return default settings when no stored settings', () => {
      const result = settings.getSettings();
      
      expect(result).toEqual({
        visibilityScope: 'Admin + Members',
        transparency: 0.92,
        weeklyReportVisible: true,
      });
    });

    it('should return stored settings when available', () => {
      const customSettings = {
        visibilityScope: 'Admin Only',
        transparency: 0.5,
        weeklyReportVisible: false,
      };
      localStorage.setItem('adminSettings', JSON.stringify(customSettings));
      
      const result = settings.getSettings();
      
      expect(result).toEqual(customSettings);
    });

    it('should merge stored settings with defaults', () => {
      localStorage.setItem('adminSettings', JSON.stringify({ visibilityScope: 'Admin Only' }));
      
      const result = settings.getSettings();
      
      expect(result.visibilityScope).toBe('Admin Only');
      expect(result.transparency).toBe(0.92);
      expect(result.weeklyReportVisible).toBe(true);
    });

    it('should return defaults for invalid JSON', () => {
      localStorage.setItem('adminSettings', 'invalid-json');
      
      const result = settings.getSettings();
      
      expect(result).toEqual({
        visibilityScope: 'Admin + Members',
        transparency: 0.92,
        weeklyReportVisible: true,
      });
    });
  });

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const newSettings = {
        visibilityScope: 'Admin Only',
        transparency: 0.5,
        weeklyReportVisible: false,
      };
      
      // Mock window.dispatchEvent
      const dispatchEventSpy = vi.fn();
      global.dispatchEvent = dispatchEventSpy;
      
      settings.saveSettings(newSettings);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'adminSettings',
        JSON.stringify(newSettings)
      );
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    });
  });
});
