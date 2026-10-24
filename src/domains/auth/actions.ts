"use server";

import { fetchServer } from "@/api/server";
import { ApiResponse } from "@/api/types";
import { Auth, Credentials } from "./types";

export async function login(credentials: Credentials) {
  const { data } = await fetchServer<ApiResponse<Auth>>(
    "/auth/login",
    {
      method: "POST",
      body: credentials,
    },
    "public"
  );

  return data;
}
