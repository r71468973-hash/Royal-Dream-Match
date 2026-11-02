/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OtaManifest {
  version: string;
  build: number;
  channel: 'production' | 'beta';
  releaseDate: string;
  mandatory: boolean;
  bundleUrl?: string;
  checksum?: string;
  releaseNotes: string;
}

export interface OtaConfig {
  currentVersion: string;
  currentBuild: number;
  manifestUrl: string;
  autoCheckOnStartup: boolean;
  allowCellular: boolean;
  channel: 'production' | 'beta';
}

// Storage keys for persistent OTA state
export const OTA_STORAGE_KEYS = {
  INSTALLED_VERSION: 'rdm_ota_installed_version',
  INSTALLED_BUILD: 'rdm_ota_installed_build',
  LAST_CHECKED: 'rdm_ota_last_checked',
  MANIFEST_URL: 'rdm_ota_manifest_url',
  AUTO_CHECK: 'rdm_ota_auto_check',
};

// Default fallback configuration
export const DEFAULT_OTA_CONFIG: OtaConfig = {
  currentVersion: '1.0.0',
  currentBuild: 1,
  // Supports GitHub Pages, Firebase Hosting, or raw GitHub content
  manifestUrl: 'https://raw.githubusercontent.com/r71468973/royal-dream-match/main/public/ota-manifest.json',
  autoCheckOnStartup: true,
  allowCellular: true,
  channel: 'production',
};
