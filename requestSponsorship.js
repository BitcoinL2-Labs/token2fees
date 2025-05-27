import fs from 'fs';
import fetch from 'node-fetch';
import { makeContractDeploy, Pc, fetchNonce, getAddressFromPrivateKey } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const server_url = process.argv[2];

console.log('sending contract call to', server_url, '...')

const privateKeyHex = fs.readFileSync('private.key', 'utf-8').trim();

const stacksAddress = getAddressFromPrivateKey(privateKeyHex, STACKS_TESTNET);

const nonce = await fetchNonce({ address: stacksAddress, network: STACKS_TESTNET });
const nonceSuffix = nonce.toString().padStart(3, '0');

const CONTRACT_NAME = 'sponsor-my-call-' + nonceSuffix;

const CONTRACT_CODE = `
(print { sponsored-call: "'STDZNQMRXTQZ6SRQQX61DZJKJV0KSRGHFETQQGZ5.crappy-token transfer 'ST3FANAWN9R8BZRFGG0F9XSM76666GANN2RZ0JWH7 u3" })
(match (contract-call? 'STDZNQMRXTQZ6SRQQX61DZJKJV0KSRGHFETQQGZ5.crappy-token transfer
    'ST3FANAWN9R8BZRFGG0F9XSM76666GANN2RZ0JWH7 u1
)
    success (begin
        (print { sponsored-call-response: (contract-call? 'ST3FANAWN9R8BZRFGG0F9XSM76666GANN2RZ0JWH7.crappy
            crappy-double u17
        ) })
        (ok true)
    )
    error (begin
        (print { sponsored-transfer-response: error })
        (ok true)
    )
)
        `;

//const postCondition = Pc.principal(stacksAddress).willSendGte(1).ft("STDZNQMRXTQZ6SRQQX61DZJKJV0KSRGHFETQQGZ5.crappy-token", "CrappyCoin");

const txOptions = {
    contractName: CONTRACT_NAME,
    codeBody: CONTRACT_CODE,
    senderKey: privateKeyHex,
    network: STACKS_TESTNET,
    fee: 0,
    sponsored: true,
    //postConditions: [postCondition]
};

const transaction = await makeContractDeploy(txOptions);

const response = await fetch(server_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: transaction.serializeBytes(),
});

const result = await response.json();
if (result.error) {
    console.error('Broadcast error:', result.error);
} else {
    console.log('Transaction ID:', result.txid);
}