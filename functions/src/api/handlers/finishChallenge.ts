import * as express from 'express';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '../../constants/collections';

export default async(request: express.Request, response: express.Response) => {
    try {
        const {body: {challengeID, winnerId, winnerNickname, loserId, loserNickname, loseScore, winScore}} = request;
        const batch = admin.firestore().batch();
        const gameHistoryDocument = {
            winnerId,
            winnerNickname,
            loserId,
            loserNickname,
            winScore: parseInt(winScore, 10),
            loseScore: parseInt(loseScore, 10)
        }
        batch.delete(admin.firestore().collection(COLLECTIONS.LIVE_GAMES).doc(challengeID));
        batch.update(admin.firestore().collection(COLLECTIONS.USERS).doc(winnerId), {
            rating: admin.firestore.FieldValue.increment(10),
            wins: admin.firestore.FieldValue.increment(1),
            duringGame: false
        });
        batch.update(admin.firestore().collection(COLLECTIONS.USERS).doc(loserId),{
            rating: admin.firestore.FieldValue.increment(-10),
            loses: admin.firestore.FieldValue.increment(1),
            duringGame: false
        } );
        await admin.firestore().collection(COLLECTIONS.HISTORY_GAMES).add(gameHistoryDocument);
        await batch.commit();
        return response.status(200).send({code: 'success', message: 'game finished succesfully'});
    } catch(e) {
        return response.status(403).send({code: 'error', message: 'something went wrong'});
    }


};