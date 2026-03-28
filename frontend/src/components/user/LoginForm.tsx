"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuthStore } from "@/stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(1, "Passord er påkrevd"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      router.push("/");
    } catch {
      setError("Feil e-post eller passord. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Velkommen tilbake
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Logg inn for å fortsette til Markedsplass
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="E-post"
          type="email"
          placeholder="din@epost.no"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Passord"
          type="password"
          placeholder="Skriv inn passord"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Logg inn
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Har du ikke konto?{" "}
        <Link
          href="/register"
          className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Registrer deg
        </Link>
      </p>
    </div>
  );
}
