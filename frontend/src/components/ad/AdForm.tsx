"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Car,
  Home,
  Shirt,
  Smartphone,
  Sofa,
  Dumbbell,
  Baby,
  Bike,
  BookOpen,
  Palette,
  Wrench,
  Gamepad2,
  PawPrint,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import ImageUpload from "./ImageUpload";
import type { UploadedImage } from "./ImageUpload";
import AdDetail from "./AdDetail";
import { PriceType, AdCondition, AdStatus } from "@/types/ad";
import type { Ad, AdCreateRequest } from "@/types/ad";
import api from "@/lib/api";

// Map Lucide icon names from backend to components
const iconMap: Record<string, LucideIcon> = {
  Car, Home, Shirt, Smartphone, Sofa, Dumbbell, Baby, Bike,
  BookOpen, Palette, Wrench, Gamepad2, PawPrint, Briefcase,
};

const colorMap: Record<string, string> = {
  Car: "bg-blue-50 text-blue-600",
  Home: "bg-emerald-50 text-emerald-600",
  Shirt: "bg-pink-50 text-pink-600",
  Smartphone: "bg-purple-50 text-purple-600",
  Sofa: "bg-amber-50 text-amber-600",
  Dumbbell: "bg-red-50 text-red-600",
  Baby: "bg-cyan-50 text-cyan-600",
  Bike: "bg-teal-50 text-teal-600",
  BookOpen: "bg-indigo-50 text-indigo-600",
  Palette: "bg-orange-50 text-orange-600",
  Wrench: "bg-slate-50 text-slate-600",
  Gamepad2: "bg-violet-50 text-violet-600",
  PawPrint: "bg-lime-50 text-lime-600",
  Briefcase: "bg-gray-50 text-gray-600",
};

interface CategoryOption {
  id: string;   // Real UUID from backend
  name: string;
  slug: string;
  icon: LucideIcon;
  color: string;
}

// Categories are fetched from API with real UUIDs
// (LEARNING 001: frontend must use actual backend IDs, not slugs)

// Fallback hardcoded list only used if API fetch fails
const fallbackCategoryOptions: CategoryOption[] = [
  {
    id: "klaer-og-mote",
    name: "Klær og mote",
    slug: "klaer-og-mote",
    icon: Shirt,
    color: "bg-pink-50 text-pink-600",
  },
  {
    id: "elektronikk",
    name: "Elektronikk",
    slug: "elektronikk",
    icon: Smartphone,
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: "mobler-og-interior",
    name: "Møbler og interiør",
    slug: "mobler-og-interior",
    icon: Sofa,
    color: "bg-amber-50 text-amber-600",
  },
  {
    id: "sport-og-fritid",
    name: "Sport og fritid",
    slug: "sport-og-fritid",
    icon: Dumbbell,
    color: "bg-red-50 text-red-600",
  },
  {
    id: "barn-og-baby",
    name: "Barn og baby",
    slug: "barn-og-baby",
    icon: Baby,
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    id: "sykkel",
    name: "Sykkel",
    slug: "sykkel",
    icon: Bike,
    color: "bg-green-50 text-green-600",
  },
  {
    id: "boker-og-media",
    name: "Bøker og media",
    slug: "boker-og-media",
    icon: BookOpen,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "kunst-og-hobby",
    name: "Kunst og hobby",
    slug: "kunst-og-hobby",
    icon: Palette,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: "verktoy",
    name: "Verktøy",
    slug: "verktoy",
    icon: Wrench,
    color: "bg-slate-50 text-slate-600",
  },
  {
    id: "gaming",
    name: "Gaming",
    slug: "gaming",
    icon: Gamepad2,
    color: "bg-violet-50 text-violet-600",
  },
];

function mapApiCategories(apiCategories: Array<{ id: string; name: string; slug: string; icon: string | null }>): CategoryOption[] {
  return apiCategories.map((cat) => ({
    id: cat.id,  // Real UUID from backend
    name: cat.name,
    slug: cat.slug,
    icon: (cat.icon && iconMap[cat.icon]) || Palette,
    color: (cat.icon && colorMap[cat.icon]) || "bg-gray-50 text-gray-600",
  }));
}

const adSchema = z.object({
  title: z
    .string()
    .min(3, "Tittel må være minst 3 tegn")
    .max(200, "Tittel kan være maks 200 tegn"),
  description: z
    .string()
    .min(10, "Beskrivelse må være minst 10 tegn")
    .max(5000, "Beskrivelse kan være maks 5000 tegn"),
  price: z.number().min(0, "Pris må være 0 eller høyere"),
  price_type: z.nativeEnum(PriceType),
  condition: z.nativeEnum(AdCondition),
  location: z.string().optional(),
});

type AdFormData = z.infer<typeof adSchema>;

const steps = ["Kategori", "Detaljer", "Bilder", "Forhåndsvisning"];

interface AdFormProps {
  onSubmit: (data: AdCreateRequest, images: UploadedImage[]) => void;
  isSubmitting?: boolean;
}

export default function AdForm({ onSubmit, isSubmitting }: AdFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(fallbackCategoryOptions);

  // Fetch real categories with UUIDs from API (LEARNING 001)
  useEffect(() => {
    api.get<Array<{ id: string; name: string; slug: string; icon: string | null }>>("/api/v1/categories/")
      .then((res) => {
        const mapped = mapApiCategories(res.data);
        if (mapped.length > 0) setCategoryOptions(mapped);
      })
      .catch(() => {
        // Fallback to hardcoded list if API unavailable
      });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      price_type: PriceType.FIXED,
      condition: AdCondition.GOOD,
      price: 0,
    },
  });

  const formValues = watch();

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedCategory !== null;
      case 1:
        return true; // Validated by form
      case 2:
        return true; // Images optional
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = (data: AdFormData) => {
    if (currentStep === 1) {
      handleNext();
      return;
    }

    if (currentStep === 3) {
      onSubmit(
        {
          ...data,
          price: Math.round(data.price * 100), // Convert to øre
          category_id: selectedCategory!,
        },
        uploadedImages
      );
    }
  };

  const selectedCategoryData = categoryOptions.find(
    (c) => c.id === selectedCategory
  );

  const previewAd: Ad = {
    id: "preview",
    title: formValues.title || "Tittel",
    description: formValues.description || "Beskrivelse",
    price: Math.round((formValues.price || 0) * 100),
    price_type: formValues.price_type || PriceType.FIXED,
    condition: formValues.condition || AdCondition.GOOD,
    status: AdStatus.ACTIVE,
    location: formValues.location || null,
    views_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: uploadedImages.map((img, i) => ({
      id: String(i),
      url: img.preview,
      thumbnail_url: img.preview,
      position: i,
    })),
    seller: {
      id: "preview",
      name: "Deg",
      avatar_url: null,
      rating: 0,
    },
    category: selectedCategoryData
      ? {
          id: selectedCategoryData.id,
          name: selectedCategoryData.name,
          slug: selectedCategoryData.slug,
          icon: selectedCategoryData.slug,
        }
      : { id: "", name: "Kategori", slug: "", icon: "" },
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center gap-2 text-sm font-medium ${
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index < currentStep
                    ? "bg-blue-600 text-white"
                    : index === currentStep
                      ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <span className="hidden sm:inline">{step}</span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Category */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Velg kategori
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoryOptions.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedCategory === category.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                          : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${category.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <h2
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Detaljer om annonsen
              </h2>

              <Input
                label="Tittel"
                placeholder="F.eks. iPhone 15 Pro Max 256GB"
                error={errors.title?.message}
                {...register("title")}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Beskrivelse
                </label>
                <textarea
                  placeholder="Beskriv det du selger..."
                  rows={5}
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900
                    placeholder:text-gray-400 transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                    ${errors.description ? "border-red-300" : "border-gray-200"}`}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Pris (kr)"
                  type="number"
                  placeholder="0"
                  error={errors.price?.message}
                  {...register("price", { valueAsNumber: true })}
                />

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pristype
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    {...register("price_type")}
                  >
                    <option value={PriceType.FIXED}>Fast pris</option>
                    <option value={PriceType.BID}>Bud</option>
                    <option value={PriceType.FREE}>Gratis</option>
                    <option value={PriceType.CONTACT}>Ta kontakt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tilstand
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    {...register("condition")}
                  >
                    <option value={AdCondition.NEW}>Ny</option>
                    <option value={AdCondition.LIKE_NEW}>Som ny</option>
                    <option value={AdCondition.GOOD}>God</option>
                    <option value={AdCondition.FAIR}>Brukbar</option>
                  </select>
                </div>

                <Input
                  label="Sted"
                  placeholder="F.eks. Oslo"
                  {...register("location")}
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Images */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Last opp bilder
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Gode bilder gir flere henvendelser. Du kan laste opp opptil 10
                bilder.
              </p>
              <ImageUpload
                images={uploadedImages}
                onChange={setUploadedImages}
              />
            </motion.div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2
                className="text-lg font-bold text-gray-900 mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Forhåndsvisning
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Slik vil annonsen din se ut:
              </p>
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
                <AdDetail ad={previewAd} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Tilbake
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type={currentStep === 1 ? "submit" : "button"}
              variant="primary"
              onClick={currentStep !== 1 ? handleNext : undefined}
              disabled={!canProceed()}
              icon={<ChevronRight className="h-4 w-4" />}
            >
              Neste
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!canProceed()}
            >
              Publiser annonse
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
