import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";
import Navbar from "../../components/Navbar";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);

  async function load() {
    const data = await apiFetch("/accounts");
    setAccounts(data);
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
      <h2>Accounts</h2>
      <pre>{JSON.stringify(accounts, null, 2)}</pre>
    </>
  );
}
