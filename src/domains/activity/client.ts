"use client";
import { fetchClient } from "@/api/client";
import { HandleError } from "@/api/error";
import { ApiResponse } from "@/api/types";
import {
  activityEventSchema,
  activityReferenceSchema,
  ActivityResource,
} from "./types";
import { encodeQueryString } from "@/utils/queries";
export async function getActivity(resource: ActivityResource) {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/activity" + encodeQueryString(resource)
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return activityEventSchema.array().parse(response.data);
}
export async function getActivityReference(code: string) {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/activity/reference/" + encodeURIComponent(code)
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return activityReferenceSchema.parse(response.data);
}
