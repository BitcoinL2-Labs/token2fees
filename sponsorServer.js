import express from 'express';
import { AuthType, deserializeTransaction, sponsorTransaction, broadcastTransaction, fetchCallReadOnlyFunction, principalCV, createStacksPublicKey, publicKeyToAddress, getAddressFromPrivateKey, createAddress } from '@stacks/transactions';
import { c32address } from 'c32check';
import { verifySignature } from '@stacks/encryption';
import { AddressVersion, STACKS_TESTNET } from '@stacks/network';
import fs from 'fs';

const app = express();
const port = 3000;

const privateKeyHex = fs.readFileSync('private.key', 'utf-8').trim();
const serverAddress = getAddressFromPrivateKey(privateKeyHex, STACKS_TESTNET);

app.use(express.raw({ type: '*/*' }));

app.post('/v2/transactions', async (req, res) => {
    try {
        const txBuffer = req.body;

        const tx = deserializeTransaction(txBuffer);

        const senderAddress = c32address(AddressVersion.TestnetSingleSig, tx.auth.spendingCondition.signer);

        console.log(senderAddress);

        // TODO validate the signature

        // TODO parse the content and validate it

        // ensure the amount of available token is enough
        const responseGetBalance = await fetchCallReadOnlyFunction({
            contractAddress: 'STDZNQMRXTQZ6SRQQX61DZJKJV0KSRGHFETQQGZ5',
            contractName: 'crappy-token',
            functionName: 'get-balance',
            functionArgs: [principalCV(senderAddress)],
            network: STACKS_TESTNET,
            senderAddress: serverAddress
        });

        console.log(responseGetBalance);

        // naive check
        if (responseGetBalance.value < 1)
        {
            res.status(400).json({ error: 'Not enough funds!' });
            return;
        }

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
    console.log(`Sponsor Server listening on port ${port}`);
});
