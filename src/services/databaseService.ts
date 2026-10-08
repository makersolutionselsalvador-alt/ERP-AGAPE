/**
 * Database & Storage Service Layer
 * 
 * Provides an abstract repository and persistence layer.
 * Currently persists data in local structured JSON storage (LocalStorage / local export),
 * completely decoupled from UI components.
 * 
 * Future Database Ready:
 * To integrate with PostgreSQL (Cloud SQL) or Firebase, replace the internal
 * adapter implementations in this service without modifying business components.
 */

export const STORAGE_PREFIX = 'nexuserp_data_';

export interface StorageStats {
  collection: string;
  count: number;
  sizeBytes: number;
}

export interface SystemBackupPayload {
  version: string;
  exportedAt: string;
  data: Record<string, any>;
}

/**
 * Low-level storage accessor with safety checks
 */
export function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[databaseService] Error parsing item ${key}:`, error);
    return defaultValue;
  }
}

export function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error(`[databaseService] Error storing item ${key}:`, error);
  }
}

export function removeLocalItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error(`[databaseService] Error removing item ${key}:`, error);
  }
}

/**
 * Computes storage metrics for all collections in Maker Solutions El Salvador
 */
export function getDatabaseDiagnostics(): {
  collections: StorageStats[];
  totalRecords: number;
  totalSizeBytes: number;
  formattedSize: string;
} {
  const collectionKeys = [
    'companySettings',
    'users',
    'roles',
    'employees',
    'branches',
    'warehouses',
    'categories',
    'products',
    'combos',
    'promotions',
    'clients',
    'suppliers',
    'stockMovements',
    'kardex',
    'purchases',
    'accountsPayable',
    'sales',
    'quotes',
    'accountsReceivable',
    'cashSessions',
    'expenses',
    'auditLogs'
  ];

  let totalRecords = 0;
  let totalSizeBytes = 0;
  const collections: StorageStats[] = [];

  collectionKeys.forEach(k => {
    const raw = localStorage.getItem(STORAGE_PREFIX + k);
    let count = 0;
    const sizeBytes = raw ? new Blob([raw]).size : 0;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        count = Array.isArray(parsed) ? parsed.length : 1;
      } catch {
        count = 1;
      }
    }
    totalRecords += count;
    totalSizeBytes += sizeBytes;
    collections.push({ collection: k, count, sizeBytes });
  });

  const formattedSize =
    totalSizeBytes < 1024
      ? `${totalSizeBytes} B`
      : totalSizeBytes < 1024 * 1024
      ? `${(totalSizeBytes / 1024).toFixed(1)} KB`
      : `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`;

  return {
    collections,
    totalRecords,
    totalSizeBytes,
    formattedSize
  };
}

/**
 * Creates a complete JSON backup export of all system collections
 */
export function exportDatabaseBackup(): string {
  const collectionKeys = [
    'companySettings',
    'users',
    'roles',
    'employees',
    'branches',
    'warehouses',
    'categories',
    'products',
    'combos',
    'promotions',
    'clients',
    'suppliers',
    'stockMovements',
    'kardex',
    'purchases',
    'accountsPayable',
    'sales',
    'quotes',
    'accountsReceivable',
    'cashSessions',
    'expenses',
    'auditLogs'
  ];

  const backupData: Record<string, any> = {};

  collectionKeys.forEach(key => {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      try {
        backupData[key] = JSON.parse(raw);
      } catch {
        backupData[key] = null;
      }
    }
  });

  const payload: SystemBackupPayload = {
    version: '2.5.0',
    exportedAt: new Date().toISOString(),
    data: backupData
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Restores a JSON backup payload into storage
 */
export function importDatabaseBackup(jsonString: string): { success: boolean; message: string; restoredCollections?: number } {
  try {
    const payload = JSON.parse(jsonString) as SystemBackupPayload;
    if (!payload || !payload.data || typeof payload.data !== 'object') {
      return { success: false, message: 'El archivo no contiene un formato de respaldo válido de Maker Solutions El Salvador.' };
    }

    let count = 0;
    Object.entries(payload.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        count++;
      }
    });

    return {
      success: true,
      message: `Copia de seguridad restaurada exitosamente (${count} colecciones restauradas).`,
      restoredCollections: count
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al procesar el archivo: ${err.message || 'Formato JSON corrupto'}`
    };
  }
}

/**
 * Clear all local storage keys for the app
 */
export function clearAllLocalData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
