import { IDatabase } from "./IDatabase";
import { Firestore } from "./implementations/firestore";

class Database {

    public client: IDatabase;

    constructor(database: IDatabase) {
        this.client = database;
    }
}

export const database = new Database(new Firestore());