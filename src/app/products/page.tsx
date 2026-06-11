import { ProductsManager } from "@/components/crud/products-manager";
import { getBusinessData } from "@/lib/data";

export default async function ProductsPage() {
  const data = await getBusinessData();

  return <ProductsManager data={data} />;
}
