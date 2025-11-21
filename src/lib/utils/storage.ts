/**
 * Safe localStorage wrapper with fallback handling
 * Handles cases where localStorage is unavailable (private browsing, quota exceeded, etc.)
 */

class StorageManager {
  private memoryStorage: Map<string, string> = new Map();
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();

    if (!this.isLocalStorageAvailable) {
      console.warn('localStorage is not available. Using in-memory storage fallback.');
    }
  }

  private checkLocalStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get item from storage
   */
  getItem(key: string): string | null {
    try {
      if (this.isLocalStorageAvailable) {
        return localStorage.getItem(key);
      }
      return this.memoryStorage.get(key) || null;
    } catch (error) {
      console.error(`Error getting item from storage (key: ${key}):`, error);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): boolean {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, value);
        // Also store in memory as backup
        this.memoryStorage.set(key, value);
        return true;
      }
      this.memoryStorage.set(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting item in storage (key: ${key}):`, error);
      // If localStorage fails (e.g., quota exceeded), fall back to memory
      this.memoryStorage.set(key, value);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
      }
      this.memoryStorage.delete(key);
    } catch (error) {
      console.error(`Error removing item from storage (key: ${key}):`, error);
      this.memoryStorage.delete(key);
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.clear();
      }
      this.memoryStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      this.memoryStorage.clear();
    }
  }

  /**
   * Get JSON object from storage
   */
  getJSON<T = any>(key: string): T | null {
    try {
      const item = this.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error parsing JSON from storage (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Set JSON object in storage
   */
  setJSON(key: string, value: any): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error stringifying JSON for storage (key: ${key}):`, error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  get available(): boolean {
    return this.isLocalStorageAvailable;
  }

  /**
   * Get all keys in storage
   */
  keys(): string[] {
    try {
      if (this.isLocalStorageAvailable) {
        return Object.keys(localStorage);
      }
      return Array.from(this.memoryStorage.keys());
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return Array.from(this.memoryStorage.keys());
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();

// Session storage manager
class SessionStorageManager {
  private memoryStorage: Map<string, string> = new Map();
  private isSessionStorageAvailable: boolean;

  constructor() {
    this.isSessionStorageAvailable = this.checkSessionStorageAvailability();

    if (!this.isSessionStorageAvailable) {
      console.warn('sessionStorage is not available. Using in-memory storage fallback.');
    }
  }

  private checkSessionStorageAvailability(): boolean {
    try {
      const testKey = '__session_storage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.isSessionStorageAvailable) {
        return sessionStorage.getItem(key);
      }
      return this.memoryStorage.get(key) || null;
    } catch (error) {
      console.error(`Error getting item from session storage (key: ${key}):`, error);
      return this.memoryStorage.get(key) || null;
    }
  }

  setItem(key: string, value: string): boolean {
    try {
      if (this.isSessionStorageAvailable) {
        sessionStorage.setItem(key, value);
        this.memoryStorage.set(key, value);
        return true;
      }
      this.memoryStorage.set(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting item in session storage (key: ${key}):`, error);
      this.memoryStorage.set(key, value);
      return false;
    }
  }

  removeItem(key: string): void {
    try {
      if (this.isSessionStorageAvailable) {
        sessionStorage.removeItem(key);
      }
      this.memoryStorage.delete(key);
    } catch (error) {
      console.error(`Error removing item from session storage (key: ${key}):`, error);
      this.memoryStorage.delete(key);
    }
  }

  get available(): boolean {
    return this.isSessionStorageAvailable;
  }
}

export const sessionStorage = new SessionStorageManager();
