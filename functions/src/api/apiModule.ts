import * as express from 'express';
import createAccout from './handlers/createAccount';
import createChallenge from './handlers/createChallenge';
import finishChallenge from './handlers/finishChallenge';

export const app = express();

exports.app.post('/create_account', createAccout);
exports.app.post('/create_challenge', createChallenge);
exports.app.post('/finish_challenge', finishChallenge);