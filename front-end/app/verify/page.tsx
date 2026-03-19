import { notFound } from "next/navigation";
import { CensusPortalVerificationPage } from "@/app/_components/role/CensusPortalVerificationPage";

type VerifyRouteProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function VerifyRoute({ searchParams }: VerifyRouteProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const token = resolvedSearchParams?.token?.trim() ?? "";

  if (!token) {
    notFound();
  }

  return <CensusPortalVerificationPage token={token} />;
}
