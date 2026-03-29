import { redirect } from "next/navigation";

// Terms of Service — redirects to Privacy Policy until full legal copy is ready
export default function TermsPage() {
  redirect("/privacy");
}
