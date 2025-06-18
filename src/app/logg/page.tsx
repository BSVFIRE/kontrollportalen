import { Suspense } from "react";
import LoggClient from "./LoggClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Laster logg...</div>}>
      <LoggClient />
    </Suspense>
  );
} 