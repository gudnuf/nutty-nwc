import { useEffect, useState } from "react";
import { Proof } from "@cashu/cashu-ts";
import { Button } from "flowbite-react";

const Balance = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setInterval(() => {
      const proofs: Proof[] = JSON.parse(
        localStorage.getItem("proofs") || "[]"
      );
      const currentBalance = proofs.reduce(
        (acc, proof) => acc + proof.amount,
        0
      );
      setBalance(currentBalance);
    }, 2000);
  });

  const handleClearBalance = () => {
    localStorage.setItem("proofs", "[]");
    setBalance(0);
  };

  return (
    <div className="flex flex-row justify-around mb-8 align-center">
      <p className="me-10 my-4 text-xl">Balance: {balance} sats</p>
      <Button color="red" onClick={handleClearBalance}>
        Delete Stored Proofs
      </Button>
    </div>
  );
};

export default Balance;
