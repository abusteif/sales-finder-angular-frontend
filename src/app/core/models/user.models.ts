export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    lastLogin: string | null;
}