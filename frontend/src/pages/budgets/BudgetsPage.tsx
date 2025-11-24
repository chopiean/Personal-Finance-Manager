import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";
import Navbar from "../../components/Navbar";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);

  async function load() {
    const data = await apiFetch("/accounts");
    setBudgets(data);
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
      <h2>Budgets</h2>
      <pre>{JSON.stringify(budgets, null, 2)}</pre>
    </>
  );
}
