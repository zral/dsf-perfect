"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuthStore } from "@/stores/authStore";

const registerSchema = z
  .object({
    name: z.string().min(2, "Navn må ha minst 2 tegn"),
    email: z.string().email("Ugyldig e-postadresse"),
    password: z.string().min(8, "Passord må ha minst 8 tegn"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passordene stemmer ikke overens",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await registerUser(data.email, data.name, data.password);
      router.push("/");
    } catch {
      setError("Kunne ikke opprette konto. Prøv igjen.");
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
          Opprett konto
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Bli med på Markedsplass i dag
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Navn"
          type="text"
          placeholder="Ditt fulle navn"
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register("name")}
        />

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
          placeholder="Minst 8 tegn"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Bekreft passord"
          type="password"
          placeholder="Gjenta passord"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Opprett konto
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Har du allerede konto?{" "}
        <Link
          href="/login"
          className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Logg inn
        </Link>
      </p>
    </div>
  );
}
