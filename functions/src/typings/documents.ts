export interface UserDocument {
    rating: number,
    wins: number,
    loses: number,
    titles: string[],
    duringGame: boolean,
    token: string,
    username: string,
    hasPendingChallenge: boolean
}

export interface ChallengeDocument {
    from: string,
    to: string,
    result: {
        winnerId: string | null,
        winnerNickname: string,
        loserId: string | null,
        loserNickname: string,
        winScore: number,
        loseScore: number
    },
    finished: boolean
}

export interface LiveChallengeDocument extends ChallengeDocument {
    expirationDate: FirebaseFirestore.Timestamp,
}