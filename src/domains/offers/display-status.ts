import { isShopeeLink } from "./affiliate-links";
import type { Offer } from "./types";
import {
  OFFER_PREPARATION_STATUS_INFO,
  OFFER_STATUS_INFO,
  OFFER_WAIT_REASON_INFO,
  OfferPreparationStatus,
  OfferStatus,
  OfferWaitReason,
} from "./offer-status";

export const statusLabels = Object.fromEntries(
  Object.entries(OFFER_STATUS_INFO).map(([status, info]) => [status, info.label]),
) as Record<Offer["status"], string>;
export const statusColors: Record<Offer["status"], string> = {
  [OfferStatus.PROCESSING]: "border-violet-700 bg-violet-700 text-white font-semibold",
  [OfferStatus.READY]: "border-cyan-800 bg-cyan-800 text-white font-semibold",
  [OfferStatus.SCHEDULED]: "border-blue-700 bg-blue-700 text-white font-semibold",
  [OfferStatus.PUBLISHING]: "border-amber-300 bg-amber-300 text-amber-950 font-semibold",
  [OfferStatus.PUBLISHED]: "border-emerald-700 bg-emerald-700 text-white font-semibold",
  [OfferStatus.FAILED]: "border-rose-700 bg-rose-700 text-white font-semibold",
  [OfferStatus.CANCELLED]: "border-orange-700 bg-orange-700 text-white font-semibold",
};
export function offerDisplayStatus(offer: Offer): {
  label: string;
  color: string;
} {
  if (offer.mirrorAffiliateStatus === "PENDING")
    return {
      label:
        offer.mirrorConversionStatus === "RECONNECT"
          ? isShopeeLink(offer.sourceUrl)
            ? OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.RECONNECT_STORE].label.replace("loja", "Shopee")
            : OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.RECONNECT_STORE].label.replace("loja", "Mercado Livre")
          : offer.mirrorConversionStatus === "CONVERTING"
            ? OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.CONVERTING_LINK].label
            : offer.mirrorConversionStatus === "FAILED"
              ? OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.REVIEW_CONVERSION].label
              : offer.mirrorConversionStatus === "STORE_REQUIRED"
                ? OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.STORE_REQUIRED].label
                : offer.mirrorConversionStatus
                  ? OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.WAITING_EXTENSION].label
                  : OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.WAITING_AFFILIATE_LINK].label,
      color:
        offer.mirrorConversionStatus === "FAILED" ||
        offer.mirrorConversionStatus === "RECONNECT"
          ? statusColors.FAILED
          : statusColors.PUBLISHING,
    };
  if (offer.mirrorAffiliateStatus && !offer.whatsappGroup)
    return { label: OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.DESTINATION_REQUIRED].label, color: statusColors.READY };
  if (offer.status === OfferStatus.PUBLISHING && offer.errorMessage)
    return { label: OFFER_PREPARATION_STATUS_INFO[OfferPreparationStatus.SEND_UNCONFIRMED].label, color: statusColors.PUBLISHING };
  if (offer.status === OfferStatus.SCHEDULED && offer.queueBlockedReason) {
    const reason = offer.queueBlockedCode
      ? OFFER_WAIT_REASON_INFO[offer.queueBlockedCode]
      : undefined;
    return {
      label: reason?.label || "Fila aguardando",
      color:
        offer.queueBlockedCode === OfferWaitReason.PAUSED
          ? statusColors.CANCELLED
          : statusColors.PUBLISHING,
    };
  }
  return {
    label: OFFER_STATUS_INFO[offer.status].label,
    color: statusColors[offer.status],
  };
}
