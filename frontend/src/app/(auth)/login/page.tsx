import AuthForm from "@/components/forms/AuthForm";

export const metadata = {
  title: "Sign In — PlacePrep AI",
  description: "Sign in to your PlacePrep AI account and continue your placement preparation journey.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
