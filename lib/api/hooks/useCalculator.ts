/**
 * M-13: Calculator API hooks.
 *
 * - useCalculate: submit calculator form → receive Good/Better/Best tiers
 *   (with offline caching of successful responses)
 * - useCreateQuoteFromCalculator: convert selected tier into a quote
 *   (with offline queue for disconnected quote creation)
 */

import { useApiMutation } from "@/lib/api/hooks";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import { useCalculatorCache } from "@/hooks/useCalculatorCache";
import type {
  CalculateRequest,
  CalculateResponse,
  CreateQuoteFromCalcRequest,
  CreateQuoteFromCalcResponse,
} from "@/lib/api/types";

// ── Calculate (POST /calculator/calculate) ──

export function useCalculate() {
  const { cacheResponse } = useCalculatorCache();

  return useApiMutation<CalculateResponse, CalculateRequest>(
    async (body) => {
      const response = await apiClient.post<CalculateResponse>(
        ENDPOINTS.CALCULATOR_CALCULATE,
        body,
      );
      // Cache successful response for offline use
      void cacheResponse(body.calculatorType, response);
      return response;
    },
  );
}

// ── Create Quote from Calculator (POST /calculator/create-quote) ──

export function useCreateQuoteFromCalculator() {
  return useOfflineMutation<CreateQuoteFromCalcResponse, CreateQuoteFromCalcRequest>({
    mutationFn: (body) =>
      apiClient.post<CreateQuoteFromCalcResponse>(
        ENDPOINTS.CALCULATOR_CREATE_QUOTE,
        body
      ),
    offline: {
      entityType: "calculator_quote",
      getEntityId: () => `calc-quote-${Date.now()}`,
      method: "POST",
      getEndpoint: () => ENDPOINTS.CALCULATOR_CREATE_QUOTE,
      getPayload: (variables) => JSON.stringify(variables),
      getDescription: (variables) =>
        `Create quote: ${variables.project_name} (${variables.selected_tier})`,
    },
  });
}
