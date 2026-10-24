"use client";
import { Offer } from "@/domains/offers/types";
import { CreateOfferForm } from "./create";
export function UpdateOfferForm({
  offer,
  onSuccess,
}: {
  offer: Offer;
  onSuccess?: () => void;
}) {
  return <CreateOfferForm offer={offer} onSuccess={onSuccess} />;
}
