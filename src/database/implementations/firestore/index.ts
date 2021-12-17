import { IDatabase } from "../../IDatabase";
import admin from 'firebase-admin'

export class Firestore implements IDatabase {

    public db: admin.firestore.Firestore;

    constructor() {
        const app = admin.initializeApp({
            credential: process.env.environment === 'production' ? admin.credential.applicationDefault() : admin.credential.cert(require(process.env.GCP_PATH)),
        });
        this.db = app.firestore();
    }

    async read_doc(collection: string, document: string): Promise<admin.firestore.DocumentData | null> {
        const doc = await this.db.collection(collection).doc(document).get();
        return doc.exists ? doc.data() : null;
    }

    async write_doc(collection: string, document: string, data: any): Promise<admin.firestore.WriteResult> {
        return this.db.collection(collection).doc(document).set(data);
    }

    async update_doc(collection: string, document: string, data: any): Promise<admin.firestore.WriteResult> {
        return this.db.collection(collection).doc(document).update(data);
    }

    get_collection(collection: string): admin.firestore.CollectionReference<admin.firestore.DocumentData> {
        return this.db.collection(collection);
    }
}