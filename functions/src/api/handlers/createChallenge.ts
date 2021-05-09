import * as express from 'express';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '../../constants/collections';
import { RESPONSE_CODES } from '../../constants/responseCodes';
import { UserDocument } from '../../typings/documents';
import { createResponseMessage } from '../../utils/createResponseMessage';

export default async(request: express.Request, response: express.Response) => {
    const {body: {from, to}} = request;
    try {
        const fromRef = admin.firestore().collection(COLLECTIONS.USERS).doc(from);
        const toRef = admin.firestore().collection(COLLECTIONS.USERS).doc(to);
        const fromData = await (await fromRef.get()).data() as UserDocument;
        const toData = await (await toRef.get()).data() as UserDocument;
        const {duringGame: isFromPlaying, hasPendingChallenge: hasPendingChallengeFrom, username} = fromData;
        const {duringGame: isToPlaying, hasPendingChallenge: hasPendingChallengeTo, token} = toData;
        if(isFromPlaying || isToPlaying || hasPendingChallengeTo || hasPendingChallengeFrom) {
            return response.status(403).send(createResponseMessage({code: RESPONSE_CODES.FIRESTORE_ERROR, message: 'user is currently in game or has pending challenge'}));
        };
        await fromRef.update({hasPendingChallenge: true});
        await toRef.update({hasPendingChallenge: true});

        const {id: challengeID} = await admin.firestore().collection(COLLECTIONS.LIVE_GAMES).add({
            from,
            to,
            participants: [from, to],
            result: {
                winnerId: null,
                winnerNickname: '',
                loserId: null,
                loserNickname: '',
                winScore: 0,
                loseScore: 0
            },
            finished: false,
            accepted: false
        });
        const fcmMessage = {
            token,
            notification: {
                body: `${username} challenged you for a rated game!`,
                title: "New challenge!"
            },
            data : {
                challengeID
            }
        } as admin.messaging.Message
        await admin.messaging().send(fcmMessage);
        return response.status(200).send(createResponseMessage({code: RESPONSE_CODES.SUCCES, message: 'challenge created', payload: {challengeID}}));
    } catch(e) {
        console.log(e);
        return response.status(403).send(createResponseMessage({code: RESPONSE_CODES.FIRESTORE_ERROR, message: e.message}));
    }
}