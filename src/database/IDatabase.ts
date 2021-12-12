export interface IDatabase {
    db: any;
    read_doc(collection: string, document: string): Promise<any>;
    write_doc(collection: string, document: string, data: any): Promise<any>;
    update_doc(collection: string, document: string, data: any): Promise<any>;
    get_collection(collection: string): any;
}