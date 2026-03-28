"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Eye, User, ChevronRight, MessageCircle } from "lucide-react";
import ImageGallery from "./ImageGallery";
import PriceTag from "./PriceTag";
import { ConditionBadge, StatusBadge } from "./Badge";
import Button from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { useSendMessage } from "@/hooks/useMessages";
import type { Ad } from "@/types/ad";
import { AdStatus } from "@/types/ad";

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Akkurat nå";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} t siden`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d siden`;
  const months = Math.floor(days / 30);
  return `${months} mnd siden`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.round(rating) ? "text-yellow-400" : "text-gray-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

interface AdDetailProps {
  ad: Ad;
}

export default function AdDetail({ ad }: AdDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const sendMessage = useSendMessage();
  const [contactMessage, setContactMessage] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isOwnAd = user?.id === ad.seller.id;
  const canContact = isAuthenticated && !isOwnAd;

  async function handleContactSeller() {
    if (!canContact) {
      router.push("/login");
      return;
    }
    setShowContactModal(true);
  }

  async function handleSendInitialMessage() {
    const content = contactMessage.trim() || `Hei! Jeg er interessert i "${ad.title}". Er den fortsatt tilgjengelig?`;
    setIsSending(true);
    try {
      const result = await sendMessage.mutateAsync({
        ad_id: ad.id,
        content,
      });
      setShowContactModal(false);
      setContactMessage("");
      router.push(`/meldinger/${result.conversation_id}`);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <a href="/" className="hover:text-gray-700 transition-colors">
          Hjem
        </a>
        <ChevronRight className="h-3.5 w-3.5" />
        <a
          href={`/category/${ad.category.slug}`}
          className="hover:text-gray-700 transition-colors"
        >
          {ad.category.name}
        </a>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {ad.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Images + Description */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={ad.images} />

          {/* Title + Price (mobile) */}
          <div className="lg:hidden space-y-3">
            <div className="flex items-center gap-2">
              <ConditionBadge condition={ad.condition} />
              {ad.status !== AdStatus.ACTIVE && (
                <StatusBadge status={ad.status} />
              )}
            </div>
            <h1
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {ad.title}
            </h1>
            <PriceTag
              price={ad.price}
              priceType={ad.price_type}
              size="lg"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Beskrivelse
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {ad.description}
            </p>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {ad.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {ad.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {timeAgo(ad.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {ad.views_count} visninger
            </span>
          </div>
        </div>

        {/* Right column: Price card + Seller card */}
        <div className="space-y-4">
          {/* Price card (desktop) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ConditionBadge condition={ad.condition} />
                {ad.status !== AdStatus.ACTIVE && (
                  <StatusBadge status={ad.status} />
                )}
              </div>
              <h1
                className="text-xl font-bold text-gray-900"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {ad.title}
              </h1>
              <PriceTag
                price={ad.price}
                priceType={ad.price_type}
                size="lg"
              />
            </div>
          </div>

          {/* Seller card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Selger
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                {ad.seller.avatar_url ? (
                  <img
                    src={ad.seller.avatar_url}
                    alt={ad.seller.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {ad.seller.name}
                </p>
                <StarRating rating={ad.seller.rating} />
              </div>
            </div>
            {!isOwnAd && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<MessageCircle className="h-4 w-4" />}
                onClick={handleContactSeller}
              >
                Kontakt selger
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Contact modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowContactModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Send melding til {ad.seller.name}
            </h3>
            <p className="text-sm text-gray-500">
              Om: {ad.title}
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder={`Hei! Jeg er interessert i "${ad.title}". Er den fortsatt tilgjengelig?`}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setShowContactModal(false)}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                icon={<MessageCircle className="h-4 w-4" />}
                isLoading={isSending}
                onClick={handleSendInitialMessage}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
