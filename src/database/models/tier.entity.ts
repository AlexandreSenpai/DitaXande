import admin from 'firebase-admin';

export interface Tier {
    id: string;
    name: string;
    position: number;
    type: string
}

export interface TierDocument extends Tier, admin.firestore.DocumentData {}