import { LocalUser } from '@/types/localUser';

const STORAGE_KEY = 'skate-deck-user';

export const getLocalUser = (): LocalUser | null => {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const setLocalUser = (user: LocalUser): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
        // Silently fail if localStorage is not available
    }
};

export const createLocalUser = (username: string): LocalUser => {
    const user: LocalUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        createdAt: new Date(),
    };

    setLocalUser(user);
    return user;
};

export const clearLocalUser = (): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Silently fail if localStorage is not available
    }
};
