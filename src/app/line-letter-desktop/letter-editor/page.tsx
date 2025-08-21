"use client";
import { useSearchParams } from "next/navigation";

export default function LineLetterPage() {
  const searchParams = useSearchParams();
  const template = searchParams.get("selectedTemplate");

  return <div>選ばれたテンプレート: {template}</div>;
}
