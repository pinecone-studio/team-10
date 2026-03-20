import { redirect } from "next/navigation";

export default function Home() {
  redirect("/inventoryHead?section=order");
}
