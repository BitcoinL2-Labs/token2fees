
import fetch from 'node-fetch';


const stacksAddress = process.argv[2];

const response = await fetch(`https://api.testnet.hiro.so/v2/accounts/${stacksAddress}`, {
    method: 'GET',
});

const result = await response.json();
if (result.error) {
    console.error('Error:', result.error);
} else {
    console.log('Balance:', BigInt(result.balance));
}