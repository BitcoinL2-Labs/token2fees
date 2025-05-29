import fs from 'fs';
import fetch from 'node-fetch';
import { makeContractDeploy, Pc, fetchNonce, getAddressFromPrivateKey } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const server_url = process.argv[3];

console.log('sending contract call to', server_url, '...')

const privateKeyHex = fs.readFileSync('private.key', 'utf-8').trim();

const stacksAddress = getAddressFromPrivateKey(privateKeyHex, STACKS_TESTNET);

const nonce = await fetchNonce({ address: stacksAddress, network: STACKS_TESTNET });
const nonceSuffix = nonce.toString().padStart(3, '0');

const CONTRACT_NAME = 'sponsor-my-call-' + nonceSuffix;

const contractCall = process.argv[2];
const escapedContractCall = contractCall.replace('"', '\"');

const CONTRACT_CODE = `
(print { sponsored-call: "${escapedContractCall}" })
(match (contract-call? 'STDZNQMRXTQZ6SRQQX61DZJKJV0KSRGHFETQQGZ5.crappy-token transfer
    'STDZNQMRXTQZ6SRQQX61DZJKJV0KSRGHFETQQGZ5 u1
)
    success (begin
        (print { sponsored-call-response: (contract-call? ${contractCall}) })
        (ok true)
    )
    error (begin
        (print { sponsored-transfer-response: error })
        (ok false)
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