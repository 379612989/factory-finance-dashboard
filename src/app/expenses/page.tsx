import { ExpensesManager } from "@/components/crud/expenses-manager";
import { getBusinessData } from "@/lib/data";

export default async function ExpensesPage() {
  const data = await getBusinessData();

  return <ExpensesManager data={data} />;
}
