import fs from 'fs';
import { makeContractDeploy, broadcastTransaction, getAddressFromPrivateKey } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const privateKeyHex = fs.readFileSync('private.key', 'utf-8').trim();

const stacksAddress = getAddressFromPrivateKey(privateKeyHex, STACKS_TESTNET);

const CONTRACT_NAME = 'crappy-token';

const contractCode = fs.readFileSync('contracts/crappy-token.clar', { encoding: 'utf8', flag: 'r' });

console.log(contractCode);

const CONTRACT_CODE = `
;; CrappyCoin SIP-10 Token

(define-constant token-name (some "CrappyCoin"))
(define-constant token-symbol (some "CRAP"))
(define-constant token-decimals u8) ;; 8 decimals

;; Owner of the contract
(define-constant contract-owner tx-sender)

;; Total supply stored in a data-var
(define-data-var total-supply uint u0)

;; Balances map: principal -> uint
(define-map balances
    { owner: principal }
    { balance: uint }
)

;; Read-only function: token name
(define-read-only (get-name)
    token-name
)

;; Read-only function: token symbol
(define-read-only (get-symbol)
    token-symbol
)

;; Read-only function: token decimals
(define-read-only (get-decimals)
    token-decimals
)

;; Read-only function: total supply
(define-read-only (get-total-supply)
    (var-get total-supply)
)

;; Read-only function: balance of an owner
(define-read-only (get-balance (owner principal))
    (default-to u0 (get balance (map-get? balances { owner: owner })))
)

;; Internal function: set balance
(define-private (set-balance
        (owner principal)
        (amount uint)
    )
    (map-set balances { owner: owner } { balance: amount })
)

;; Public function: mint tokens (only owner)
(define-public (mint
        (recipient principal)
        (amount uint)
    )
    (begin
        (asserts! (is-eq tx-sender contract-owner) (err u100))
        (let (
                (current-balance (default-to u0
                    (get balance (map-get? balances { owner: recipient }))
                ))
                (current-supply (var-get total-supply))
            )
            (begin
                (var-set total-supply (+ current-supply amount))
                (set-balance recipient (+ current-balance amount))
                (ok true)
            )
        )
    )
)

;; Public function: transfer tokens
(define-public (transfer
        (recipient principal)
        (amount uint)
    )
    (let (
            (sender tx-sender)
            (sender-balance (default-to u0 (get balance (map-get? balances { owner: tx-sender }))))
            (recipient-balance (default-to u0 (get balance (map-get? balances { owner: recipient }))))
        )
        (if (>= sender-balance amount)
            (begin
                (set-balance sender (- sender-balance amount))
                (set-balance recipient (+ recipient-balance amount))
                (ok true)
            )
            (err u101)
        )
    )
)
`;

const txOptions = {
    contractName: CONTRACT_NAME,
    codeBody: CONTRACT_CODE,
    senderKey: privateKeyHex,
    network: STACKS_TESTNET,
};

const transaction = await makeContractDeploy(txOptions);

const response = await broadcastTransaction({ transaction, STACKS_TESTNET });

if (response.error) {
    console.error('Broadcast error:', response.error);
} else {
    console.log('Transaction ID:', response.txid);
}