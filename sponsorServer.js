import express from 'express';
import { AuthType, deserializeTransaction, sponsorTransaction, broadcastTransaction } from '@stacks/transactions';
import { verifySignature } from '@stacks/encryption';
import { STACKS_TESTNET } from '@stacks/network';
import fs from 'fs';

const app = express();
const port = 3000;

const privateKeyHex = fs.readFileSync('private.key', 'utf-8').trim();

app.use(express.raw({ type: '*/*' }));

app.post('/v2/transactions', async (req, res) => {
    try {
        const txBuffer = req.body;

        const tx = deserializeTransaction(txBuffer);

        // TODO validate the signature

        // TODO parse the content and validate it

        console.log('Contract name:', tx.payload.contractName);
        console.log('Contract body:', tx.payload.codeBody);
        console.log('Contract is sponsored:', tx.auth.authType == AuthType.Sponsored);
        console.log('Contract fee (must be 0):', tx.auth.spendingCondition.fee);

        const sponsoredTx = await sponsorTransaction({
            transaction: tx,
            sponsorPrivateKey: privateKeyHex
        });

        const response = await broadcastTransaction({ transaction: sponsoredTx, STACKS_TESTNET });

        if (response.error) {
            console.error('Broadcast error:', response.error);
        } else {
            console.log('Transaction ID:', response.txid);
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error parsing transaction:', error);
        res.status(400).json({ error: 'Invalid transaction format' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
