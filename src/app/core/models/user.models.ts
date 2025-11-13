export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    lastLogin: string | null;
    maxAlerts: number;
    maxStoresPerAlert: number;
    role: UserRole;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}