export default function Borrow() {
  const [amount, setAmount] = useState("");

  const handleBorrow = async () => {
    await borrow(
      provider,
      import.meta.env.VITE_AAVE_ADAPTER,
      USDC,
      amount
    );
  };

  return (
    <div>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleBorrow}>Borrow</button>
    </div>
  );
}
