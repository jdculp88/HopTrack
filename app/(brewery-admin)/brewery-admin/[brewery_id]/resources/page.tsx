import { BookOpen } from "lucide-react";
import { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import ResourcesClient from "./ResourcesClient";

export const metadata: Metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pt-16 lg:pt-8">
      <PageHeader
        title="Resources"
        subtitle="Guides, documentation, and reference materials for your team."
        icon={BookOpen}
      />
      <ResourcesClient />
    </div>
  );
}
