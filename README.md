# Nutty NWC

Send ecash via nostr wallet connect (NWC)

This repo is me trying to figure out how this would work.

Feel free to try it out at [nutty-nwc.vercel.app](https://nutty-nwc.vercel.app). You will need to open two browsers with different local storage and have webln (ie. Alby) on at least one browser to load in the initial funds.

## Idea

Use nostr to send Cashu tokens. 

With two NWC-enabled Cashu wallets, all that is required to send tokens is the recipient's public key, and the relay(s) they are listening on.

With this information, we can create an NWC payload with tokens inside and broadcast to nostr.

## How

There are two ways to send with this idea in mind. It helps to think of them within the context of lightning... there is "keysend" and there is "BOLT 12"

So far I have implemented the "keysend" method. 

### Keysend

This is very similar to keysend on the lightning network.

With another user's public key, we can create an NWC request event with a method of `cashu_keysend` that contains proofs we want to give to the other user.

The payload would look something like this:

```json
{
   method: "cashu_keysend",
   "params": {
       "proofs": Array<Proof>
    }
}
```

This payload will then be encrypted with an ECDH key (our private key plus the recipient's public key). See [NIP-47](https://github.com/nostr-protocol/nips/blob/master/47.md).

The recipient's wallet should be subscribed to NWC requests (kind 23194) tagged with their public key. When their wallet decrypts the event content they will see proofs inside, swap for new tokens, and should then send a response (kind 23195) to ack the payment.

### BOLT 12

Not yet implemented.

Obviously, this does not use BOLT 12, but the flow is similar.

Instead of directly sending proofs to another wallet, this method allows the recipient to specify the blinded messages (and possibly the mint) they would prefer. This makes the most sense when the recipient creates blinded messages with a P2PK lock.

#### Flow:

**Alice** sender

**Bob** receiver

- Similar to the NWC method [make_invoice](https://github.com/nostr-protocol/nips/blob/master/47.md#make_invoice), Alice can send a message to Bob saying "I want to pay you 10 sats'.

- Bob receives Alice's request, creates blinded messages to match the requested amount, and responds via NWC to Alice.

- Alice uses the blinded messages in Bob's response to mint new tokens, and then send them over NWC to Bob.


## Other Ideas

The above methods describe how to do ecash-to-ecash payments. What about lightning-to-ecash and ecash-to-lightning?

These may not make as much sense but could be useful if a Cashu-only wallet wants to receive a payment from a lightning-only wallet (both must speak NWC) or visa-versa.

## Ecash to lightning

Going from ecash to lightning is simple. Send a `pay_invoice` NWC request with an invoice and the corresponding amount of proofs to melt.

## Lightning to ecash

There are two ways this could go:

1. Use lightning to mint tokens, and then follow the above methods of ecash-to-ecash payments.
2. Get a bolt11 invoice from the recipient over NWC and then pay it. Once paid the recipient will be able to mint new tokens.
