import { Suspense } from "react";
import ClientKds from "./ClientKds";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-200">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
        <ClientKds />
      </Suspense>
    </div>
  );
}
