import { useRef, useEffect, useState } from "react";
import NDK, {
  NDKEvent,
  NDKFilter,
  NDKKind,
  NDKPrivateKeySigner,
  NDKSubscriptionOptions,
  NostrEvent,
} from "@nostr-dev-kit/ndk";
import {
  decryptEventContent,
  encryptEventContent,
  getSetKeyPair,
} from "@/utils/nostr";
import { addProofsToBalance } from "@/utils/crud";
import { Proof } from "@cashu/cashu-ts";

interface UseNwcProps {
  listenRelay: `wss://${string}`;
}

export const useNwc = ({ listenRelay }: UseNwcProps) => {
  const [privkey, setPrivkey] = useState<Uint8Array>();
  const [pubkey, setPubkey] = useState<string>();
  const [ndkConnected, setNdkConnected] = useState(false);
  const ndk = useRef<NDK | null>(null);

  useEffect(() => {
    const { privkey, pubkey } = getSetKeyPair();

    setPrivkey(privkey);
    setPubkey(pubkey);
  }, []);

  const cashuKeysend = async (proofs: Proof[], receiverPubkey: string) => {
    if (!ndk.current) {
      throw new Error("NDK not connected!");
    }
    if (!privkey) return;

    const data = {
      method: "cashu_keysend",
      params: {
        proofs,
      },
    };

    const encrypted = await encryptEventContent(privkey, receiverPubkey, data);

    const reqEvent = new NDKEvent(ndk.current, {
      kind: NDKKind.NostrWalletConnectReq,
      content: encrypted,
      tags: [["p", receiverPubkey]],
    } as NostrEvent);

    const signer = new NDKPrivateKeySigner(
      Buffer.from(privkey).toString("hex")
    );

    await reqEvent.sign(signer);
    const res = await reqEvent.publish();

    console.log("Sent request:", reqEvent.rawEvent());
    console.log("Request data:", data);
    console.log("Published to", res);
  };

  // Connect to NDK
  useEffect(() => {
    ndk.current = new NDK({ explicitRelayUrls: [listenRelay] });
    ndk.current
      .connect()
      .then(() => {
        console.log("NDK connected to ", listenRelay);
        setNdkConnected(true);
      })
      .catch((e) => console.error("NDK connection error", e));
  }, [listenRelay]);

  const onRes = (res: NDKEvent) => {
    console.log("Response", res.rawEvent());
  };

  const onReq = async (req: NDKEvent) => {
    console.log("Request", req.rawEvent());

    const data = await decryptEventContent(req, privkey!);
    console.log("Decrypted request", data);

    if (data.method !== "cashu_keysend") {
      console.error("Unknown method", data.method);
      return;
    }

    const proofs = data.params.proofs;

    console.log("Received tokens", proofs);

    addProofsToBalance(proofs);
  };

  // Subscribe to requests (23194)  and responses (23195)
  useEffect(() => {
    if (!ndkConnected || !pubkey) return;
    if (!ndk.current) {
      throw new Error("NDK not connected!");
    }

    const baseFilter: NDKFilter = {
      "#p": [pubkey],
      since: Math.floor(Date.now() / 1000),
    };

    const opts: NDKSubscriptionOptions = {
      closeOnEose: false,
    };

    const resSub = ndk.current.subscribe(
      {
        ...baseFilter,
        kinds: [NDKKind.NostrWalletConnectRes],
      },
      opts
    );

    const reqSub = ndk.current.subscribe(
      {
        ...baseFilter,
        kinds: [NDKKind.NostrWalletConnectReq],
      },
      opts
    );

    console.log("Subscribed to requests and responses");

    resSub.on("event", onRes);
    reqSub.on("event", onReq);
  }, [ndkConnected, pubkey]);

  return {
    cashuKeysend,
    pubkey,
  };
};
