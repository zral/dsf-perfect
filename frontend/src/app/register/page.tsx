import RegisterForm from "@/components/user/RegisterForm";

export const metadata = {
  title: "Registrer deg — Markedsplass",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
