import { NDKEvent } from "@nostr-dev-kit/ndk";
import { generateSecretKey, getPublicKey, nip04 } from "nostr-tools";

export const decryptEventContent = async (
  event: NDKEvent,
  secretKey: Uint8Array
) => {
  try {
    const decrypted = await nip04.decrypt(
      secretKey,
      event.pubkey,
      event.content
    );
    return JSON.parse(decrypted);
  } catch (e) {
    console.error("Error decrypting event content", e);
    throw e;
  }
};

export const encryptEventContent = async (
  secretKey: Uint8Array,
  pubkey: string,
  content: any
) => {
  try {
    const encrypted = await nip04.encrypt(
      secretKey,
      pubkey,
      JSON.stringify(content)
    );
    return encrypted;
  } catch (e) {
    console.error("Error encrypting event content", e);
    throw e;
  }
};

export const getSetKeyPair = () => {
  const storedPrivkey = localStorage.getItem("privkey");
  let privkey: Uint8Array;

  if (storedPrivkey) {
    privkey = new Uint8Array(JSON.parse(storedPrivkey));
  } else {
    privkey = generateSecretKey()
    localStorage.setItem("privkey", JSON.stringify(Array.from(privkey)));
  }

  const pubkey = getPublicKey(privkey);

  return { privkey, pubkey };
}
