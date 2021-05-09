import * as express from 'express';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '../../constants/collections';
import { RESPONSE_CODES } from '../../constants/responseCodes';
import { ChallengeDocument } from '../../typings/documents';
import { createResponseMessage } from '../../utils/createResponseMessage';

export default async(request: express.Request, response: express.Response) => {
    const {body: {challengeID}} = request;
    try {
        const batch = admin.firestore().batch();
        const challengeDocRef = admin.firestore().collection(COLLECTIONS.LIVE_GAMES).doc(challengeID);
        const {from, to} = (await challengeDocRef.get()).data() as ChallengeDocument;
        batch.update(challengeDocRef, {accepted: true});
        batch.update(admin.firestore().collection(COLLECTIONS.USERS).doc(from), {hasPendingChallenge: false, duringGame: true});
        batch.update(admin.firestore().collection(COLLECTIONS.USERS).doc(to), {hasPendingChallenge: false, duringGame: true});
        await batch.commit();
        return response.status(200).send(createResponseMessage({code: RESPONSE_CODES.SUCCES, message: 'challenge accepted'}));
    } catch(e) {
        return response.status(403).send(createResponseMessage({code: RESPONSE_CODES.FIRESTORE_ERROR, message: e.message}));
    }
}