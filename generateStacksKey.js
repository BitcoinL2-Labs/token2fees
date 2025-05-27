import { makeRandomPrivKey } from '@stacks/transactions';
import fs from 'fs';

const key = makeRandomPrivKey();

const filename = 'private.key';

if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, key.toString('hex'), 'utf-8');

    console.log('Private key stored in', filename);
}
else {
    console.log('Private key already exists in', filename);
}