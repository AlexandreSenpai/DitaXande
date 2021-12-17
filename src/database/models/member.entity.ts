import admin from 'firebase-admin';

export interface Member {
    id: string;
    user: string;
    role: {
        tier: admin.firestore.DocumentData;
        name: string;
    }
    tracking: {
        drop_timestamp: number;
        last_activity: number;
    }
}