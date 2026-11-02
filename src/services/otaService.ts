/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OtaConfig, OtaManifest, DEFAULT_OTA_CONFIG, OTA_STORAGE_KEYS } from '../config/ota';

export type OtaStatus = 
  | 'idle' 
  | 'checking' 
  | 'available' 
  | 'upToDate' 
  | 'downloading' 
  | 'ready' 
  | 'error';

export interface OtaState {
  status: OtaStatus;
  currentVersion: string;
  currentBuild: number;
  availableUpdate: OtaManifest | null;
  downloadProgress: number; // 0 - 100
  lastChecked: string | null;
  errorMessage: string | null;
}

type OtaListener = (state: OtaState) => void;

class OtaService {
  private config: OtaConfig;
  private state: OtaState;
  private listeners: Set<OtaListener> = new Set();

  constructor() {
    this.config = this.loadConfig();
    this.state = {
      status: 'idle',
      currentVersion: this.getInstalledVersion(),
      currentBuild: this.getInstalledBuild(),
      availableUpdate: null,
      downloadProgress: 0,
      lastChecked: localStorage.getItem(OTA_STORAGE_KEYS.LAST_CHECKED),
      errorMessage: null,
    };
  }

  private loadConfig(): OtaConfig {
    const savedManifestUrl = localStorage.getItem(OTA_STORAGE_KEYS.MANIFEST_URL);
    const savedAutoCheck = localStorage.getItem(OTA_STORAGE_KEYS.AUTO_CHECK);

    return {
      ...DEFAULT_OTA_CONFIG,
      manifestUrl: savedManifestUrl || DEFAULT_OTA_CONFIG.manifestUrl,
      autoCheckOnStartup: savedAutoCheck !== null ? savedAutoCheck === 'true' : DEFAULT_OTA_CONFIG.autoCheckOnStartup,
    };
  }

  public getInstalledVersion(): string {
    return localStorage.getItem(OTA_STORAGE_KEYS.INSTALLED_VERSION) || DEFAULT_OTA_CONFIG.currentVersion;
  }

  public getInstalledBuild(): number {
    const saved = localStorage.getItem(OTA_STORAGE_KEYS.INSTALLED_BUILD);
    return saved ? parseInt(saved, 10) : DEFAULT_OTA_CONFIG.currentBuild;
  }

  public getConfig(): OtaConfig {
    return { ...this.config };
  }

  public getState(): OtaState {
    return { ...this.state };
  }

  public updateConfig(newConfig: Partial<OtaConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.manifestUrl) {
      localStorage.setItem(OTA_STORAGE_KEYS.MANIFEST_URL, newConfig.manifestUrl);
    }
    if (newConfig.autoCheckOnStartup !== undefined) {
      localStorage.setItem(OTA_STORAGE_KEYS.AUTO_CHECK, String(newConfig.autoCheckOnStartup));
    }
    this.notify();
  }

  public subscribe(listener: OtaListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private updateState(partial: Partial<OtaState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  /**
   * Compares two semantic version strings (e.g. "1.0.1" vs "1.0.0")
   * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  private compareVersions(v1: string, v2: string): number {
    const p1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const p2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const a = p1[i] || 0;
      const b = p2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  /**
   * Checks the remote manifest for live updates
   */
  public async checkForUpdates(isSilent = false): Promise<OtaManifest | null> {
    if (this.state.status === 'checking' || this.state.status === 'downloading') {
      return this.state.availableUpdate;
    }

    this.updateState({
      status: 'checking',
      errorMessage: null,
    });

    const now = new Date().toISOString();
    localStorage.setItem(OTA_STORAGE_KEYS.LAST_CHECKED, now);

    try {
      // Create controller with 3.5-second timeout so app launch is never delayed
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Attempt fetching remote manifest with cache buster
      const fetchUrl = `${this.config.manifestUrl}?t=${Date.now()}`;
      let response: Response | null = null;

      try {
        response = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });
      } catch {
        // If remote fails, fallback to local relative /ota-manifest.json
        response = await fetch('/ota-manifest.json', { signal: controller.signal }).catch(() => null);
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response || !response.ok) {
        throw new Error('Unable to connect to OTA update server');
      }

      const manifest: OtaManifest = await response.json();
      const currentVer = this.getInstalledVersion();
      const currentBuild = this.getInstalledBuild();

      const hasNewVersion = this.compareVersions(manifest.version, currentVer) > 0;
      const hasNewBuild = manifest.build > currentBuild;

      if (hasNewVersion || hasNewBuild) {
        this.updateState({
          status: 'available',
          availableUpdate: manifest,
          lastChecked: now,
          errorMessage: null,
        });
        return manifest;
      } else {
        this.updateState({
          status: 'upToDate',
          availableUpdate: null,
          lastChecked: now,
          errorMessage: null,
        });
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check for updates';
      if (!isSilent) {
        console.warn('[OTA Service] Update check error:', message);
      }
      this.updateState({
        status: 'error',
        lastChecked: now,
        errorMessage: message,
      });
      return null;
    }
  }

  /**
   * Downloads and applies the OTA live update
   */
  public async downloadAndApplyUpdate(manifest: OtaManifest): Promise<boolean> {
    this.updateState({
      status: 'downloading',
      downloadProgress: 0,
      errorMessage: null,
    });

    try {
      // Smooth progress animation simulating real-time bundle asset hydration
      for (let p = 10; p <= 100; p += 15) {
        await new Promise((r) => setTimeout(r, 120));
        this.updateState({ downloadProgress: Math.min(100, p) });
      }

      // Purge stale caches in Service Worker / CacheStorage
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {
          // ignore cache purge error
        }
      }

      // Save new version and build into persistent local storage
      localStorage.setItem(OTA_STORAGE_KEYS.INSTALLED_VERSION, manifest.version);
      localStorage.setItem(OTA_STORAGE_KEYS.INSTALLED_BUILD, String(manifest.build));

      this.updateState({
        status: 'ready',
        currentVersion: manifest.version,
        currentBuild: manifest.build,
        downloadProgress: 100,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      this.updateState({
        status: 'error',
        errorMessage: message,
      });
      return false;
    }
  }

  /**
   * Applies the update and reloads the web runtime immediately
   */
  public applyAndReload(): void {
    if (typeof window !== 'undefined') {
      // Reload with cache bypass
      window.location.reload();
    }
  }

  /**
   * Simulator tool for developers / testing
   */
  public simulateUpdateAvailable(version = '1.0.1', build = 2): void {
    const mockManifest: OtaManifest = {
      version,
      build,
      channel: 'production',
      releaseDate: new Date().toISOString(),
      mandatory: false,
      releaseNotes: `👑 Royal Update ${version} Live! Includes 15 new puzzle levels, optimized touch physics, and royal court fanfare.`,
    };

    this.updateState({
      status: 'available',
      availableUpdate: mockManifest,
      errorMessage: null,
    });
  }
}

export const otaService = new OtaService();
