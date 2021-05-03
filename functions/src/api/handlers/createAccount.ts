import * as express from 'express';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '../../constants/collections';

const defaultTitles: string[] = [];

const baseUserDocument = {
    rating: 1000,
    wins: 0,
    loses: 0,
    titles: defaultTitles,
    duringGame: false,
}

export default async(request: express.Request, response: express.Response): Promise<express.Response> => {
    const {body: {email, password, username}} = request;
    try {
        const {id: firestoreID} = await admin.firestore().collection(COLLECTIONS.USERS).add({username, ...baseUserDocument});
        const {uid: authID} = await admin.auth().createUser({
            email: email,
            password: password,
            disabled: false,
        });
        await admin.auth().setCustomUserClaims(authID, {firestoreID});
        return response.status(200).send(firestoreID);
    } catch(e) {
        return response.status(403).send('Something went wrong');
    }
}