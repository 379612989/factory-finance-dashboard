import { CustomersManager } from "@/components/crud/customers-manager";
import { getBusinessData } from "@/lib/data";

export default async function CustomersPage() {
  const data = await getBusinessData();

  return <CustomersManager data={data} />;
}
