import { getAddressFromPrivateKey } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import fs from 'fs';

const privateKeyHex = fs.readFileSync('private.key', 'utf-8').trim();

const stacksAddress = getAddressFromPrivateKey(privateKeyHex, STACKS_TESTNET);
console.log('Stacks address:', stacksAddress);