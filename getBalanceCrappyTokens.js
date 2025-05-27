import { fetchCallReadOnlyFunction, principalCV, getAddressFromPrivateKey } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

import fs from 'fs';

const privateKeyHex = fs.readFileSync('private.key', 'utf-8').trim();

const senderAddress = getAddressFromPrivateKey(privateKeyHex, STACKS_TESTNET);

const response = await fetchCallReadOnlyFunction({
    contractAddress: 'STDZNQMRXTQZ6SRQQX61DZJKJV0KSRGHFETQQGZ5',
    contractName: 'crappy-token',
    functionName: 'get-balance',
    functionArgs: [principalCV(process.argv[2])],
    network: STACKS_TESTNET,
    senderAddress
});

console.log(response)