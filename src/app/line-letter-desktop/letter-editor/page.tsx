"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TemplateContent() {
  const searchParams = useSearchParams();
  const template = searchParams.get("template");

  return <div>選ばれたテンプレート: {template}</div>;
}

export default function LineLetterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplateContent />
    </Suspense>
  );
}