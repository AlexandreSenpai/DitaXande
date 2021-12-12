import { IDatabase } from "../../IDatabase";
import admin from 'firebase-admin'

export class Firestore implements IDatabase {

    private service_account = require('/mnt/e/Users/alexa/Documents/credentials/GCP/eroneko.json')
    public db: admin.firestore.Firestore;

    constructor() {
        const app = admin.initializeApp({
            credential: admin.credential.cert(this.service_account),
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