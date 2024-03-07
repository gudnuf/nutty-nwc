import { Proof } from "@cashu/cashu-ts";

export const addProofsToBalance = async (proofs: Proof[]) => {
  const storedProofs = localStorage.getItem("proofs") || "[]";

  const newProofs = JSON.stringify([...JSON.parse(storedProofs), ...proofs]);

  localStorage.setItem("proofs", newProofs);
}

export const getProofsFromBalance = (): Proof[] => {
  const storedProofs = localStorage.getItem("proofs") || "[]";

  return JSON.parse(storedProofs);
}

export const removeProofsFromBalance = (proofs: Proof[]) => {
  const storedProofs = localStorage.getItem("proofs") || "[]";

  const newProofs = JSON.stringify(
    JSON.parse(storedProofs).filter(
      (p: Proof) => !proofs.find((proof) => proof.id === p.id)
    )
  );

  localStorage.setItem("proofs", newProofs);
}