import fs from 'fs';
import { makeContractCall, broadcastTransaction, uintCV, principalCV, getAddressFromPrivateKey } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const privateKeyHex = fs.readFileSync('private.key', 'utf-8').trim();

const stacksAddress = getAddressFromPrivateKey(privateKeyHex, STACKS_TESTNET);

const txOptions = {
    contractAddress: 'STDZNQMRXTQZ6SRQQX61DZJKJV0KSRGHFETQQGZ5',
    contractName: 'crappy-token',
    functionName: 'transfer',
    functionArgs: [principalCV(process.argv[2]), uintCV(process.argv[3])],
    senderKey: privateKeyHex,
    network: STACKS_TESTNET,
};
const transaction = await makeContractCall(txOptions);

const response = await broadcastTransaction({ transaction, STACKS_TESTNET });

if (response.error) {
    console.error('Broadcast error:', response.error);
} else {
    console.log('Transaction ID:', response.txid);
}