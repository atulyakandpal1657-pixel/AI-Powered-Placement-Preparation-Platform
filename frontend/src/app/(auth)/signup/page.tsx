import AuthForm from "@/components/forms/AuthForm";

export const metadata = {
  title: "Create Account — PlacePrep AI",
  description: "Create your PlacePrep AI account and start preparing for placements with AI-powered tools.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
