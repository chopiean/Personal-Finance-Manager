import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";
import Navbar from "../../components/Navbar";

export default function TransactionsPage() {
  const [list, setList] = useState([]);

  async function load() {
    const data = await apiFetch("/accounts");
    setList(data);
  }

  useEffect(() => {
    const fetchData = async () => {
      await load();
    };
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <h2>Transactions</h2>
      <pre>{JSON.stringify(list, null, 2)}</pre>
    </>
  );
}
