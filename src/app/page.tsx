import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { getBusinessData } from "@/lib/data";

export default async function Home() {
  const data = await getBusinessData();

  return <DashboardPage initialData={data} />;
}
