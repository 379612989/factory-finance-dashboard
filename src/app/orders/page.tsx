import { OrdersManager } from "@/components/crud/orders-manager";
import { getBusinessData } from "@/lib/data";

export default async function OrdersPage() {
  const data = await getBusinessData();

  return <OrdersManager data={data} />;
}
