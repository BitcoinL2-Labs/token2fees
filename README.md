# token2fees

POC for showing how to implement a sponsoring server using SIP-10 tokens as fees.

Only contract-calls are supported for now.

## Logic

The user crafts a contract-deploy transaction (yes a deploy not a call) with the goal of having an atomic send of the tokens
to the sponsor plus the contract call:

```
(print { sponsored-call: "'ST3FANAWN9R8BZRFGG0F9XSM76666GANN2RZ0JWH7.crappy crappy-double u17" })
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
```

* for improving the user experience, the contract-deploy emits 2 events (sponsored-call + sponsored-call-response if the token transfer is successfull and sponsored-call + sponsored-transfer-response on token transfer failure)
* the user contract-call must be execute only if the transfer is successfull
* the sponsored-call print must be equal to the arguments of the user contract-call

The transaction is signed and sent to the sponsoring server (same HTTP API of stacks-core/hiro).

The sponsoring server validates the transaction, sponsor it and broadcast to the network.

## Validation

* the only "dynamic" part of the contract-deploy must be the contract-call? arguments (in the previous example `'ST3FANAWN9R8BZRFGG0F9XSM76666GANN2RZ0JWH7.crappy crappy-double u17`) and the amount of tokens to transfer (unless obviously the sponsoring service wants to apply a fixed fee for everything)
* the transaction must be correctly signed
* the amount of tokens should be compared with the required STX for the specific transaction (the estimate endpoint could be used)

## Testing

* generateStacksKey.js can be used for generating a new stacks private key (it will be saved in private.key)
* deployCrappyTokenContract.js will deploy the "CrappyCoin" contract (using the private.key file)
* with mintCrappyTokens.js you can add tokens to your address
* sponsorServer.js will run a sponsoring service on localhost:3000
* requestSponsorship.js can be used to send contract-deploy to the sponsor server
