import { Firestore } from ".";

it('need to retrieve document from firestore', async () => {
    const firestore = new Firestore();
    const document = await firestore.read_doc('members', 'Alexandre Ramos#6851')
    expect(document).toBeDefined();
})