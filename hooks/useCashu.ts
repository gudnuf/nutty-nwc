import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import {
  addProofsToBalance,
  getProofsFromBalance,
  removeProofsFromBalance,
} from "@/utils/crud";
import { useEffect } from "react";

export interface CashuHookProps {
  mintUrl: string | undefined;
}

export const useCashu = ({ mintUrl }: CashuHookProps) => {
  if (!mintUrl) {
    throw new Error("Set mint url in .env file: NEXT_PUBLIC_MINT_URL=...");
  }

  const wallet = new CashuWallet(new CashuMint(mintUrl));

  const getEcashViaLn = async (amount: number) => {
    const { pr, hash } = await wallet.requestMint(amount);

    await window.webln.enable();
    await window.webln.sendPayment(pr);

    const { proofs } = await wallet.requestTokens(amount, hash);

    addProofsToBalance(proofs);
  };

  const getProofsToSend = async (amount: number) => {
    const ourProofs = getProofsFromBalance();

    if (ourProofs.length === 0) {
      throw new Error("No proofs to send");
    }

    const { send, returnChange } = await wallet.send(amount, ourProofs);

    removeProofsFromBalance(ourProofs);
    addProofsToBalance(returnChange);

    return send;
  };

  useEffect(() => {
    if (!window.webln) {
      console.error(
        "WebLN not available! Make sure you have something like the Alby browser extension to enable window.webln"
      );
    }
  });

  return {
    getEcashViaLn,
    getProofsToSend,
  };
};
