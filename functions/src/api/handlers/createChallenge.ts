import * as express from 'express';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '../../constants/collections';
import { UserDocument } from '../../typings/documents';

export default async(request: express.Request, response: express.Response) => {
    const {body: {from, to}} = request;
    try {
        const fromRef = admin.firestore().collection(COLLECTIONS.USERS).doc(from);
        const toRef = admin.firestore().collection(COLLECTIONS.USERS).doc(to);
        const fromData = await (await fromRef.get()).data() as UserDocument;
        const toData = await (await toRef.get()).data() as UserDocument;
        const {duringGame: isFromPlaying, username} = fromData;
        const {duringGame: isToPlaying, token} = toData;
        if(isFromPlaying || isToPlaying) {
            return response.status(403).send({code: 'error', message: 'one or more of users are currently in game'});
        };
        await fromRef.update({duringGame: true});
        await toRef.update({duringGame: true});

        const {id: challengeID} = await admin.firestore().collection(COLLECTIONS.LIVE_GAMES).add({
            from,
            to,
            result: {
                winnerId: null,
                winnerNickname: '',
                loserId: null,
                loserNickname: '',
                winScore: 0,
                loseScore: 0
            },
            finished: false
        });
        const fcmMessage = {
            token,
            notification: {
                body: `${username} challenged you for a rated game!`,
                title: "New challenge"
            },
            data : {}
        } as unknown as admin.messaging.Message
        await admin.messaging().send(fcmMessage);
        return response.status(200).send({code: 'success', message: 'challenge created', challengeID});
    } catch(e) {
        console.log(e);
        return response.status(403).send({code: 'error', message: 'something went wrong'})
    }
}