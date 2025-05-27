# token2fees

POC for showing how to implement a sponsoring server using SIP-10 tokens as fees.

Only contract-calls are supported for now.

## Logic

The user craft a contract-deploy transaction (yes a deploy not a call) with the goal of having an atomic send of the tokens
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

* for improving the user experience, the contract-deplpy emits 2 events (sponsored-call + sponsored-call-response if the token transfer is successfull and sponsored-call + sponsored-transfer-response on token transfer failure)
* the user contract-call must be execute only if the transfer is successfull
* the sponsored-call print must be equal to the arguments of the user contract-call
