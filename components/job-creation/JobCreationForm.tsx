import React, { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBriefcase,
  faLocationDot,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { View, Text, TextInput } from "@/tw";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AccountPicker } from "@/components/job-creation/AccountPicker";
import { ServiceTypePicker } from "@/components/job-creation/ServiceTypePicker";
import { DateTimePicker } from "@/components/job-creation/DateTimePicker";
import { TeamAssignment } from "@/components/job-creation/TeamAssignment";
import { useCreateJob } from "@/lib/api/hooks/useJobCreation";
import { showToast } from "@/store/toast-store";
import { ApiError } from "@/lib/api/client";
import type { JobDetail, AccountListItem } from "@/lib/api/types";
import { colors } from "@/constants/tokens";

// ── Zod Schema ──

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  account_id: z.string().optional(),
  service_address: z.string().min(1, "Address is required").max(500),
  job_type: z.string().default("cleaning"),
  scheduled_start: z.string().optional(),
  scheduled_end: z.string().optional(),
  estimated_hours: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      const num = parseFloat(val);
      return isNaN(num) ? undefined : num;
    })
    .pipe(z.number().min(0).max(1000).optional()),
  assigned_to: z.array(z.string()).default([]),
  special_instructions: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

type CreateJobFormData = z.output<typeof createJobSchema>;
type CreateJobFormInput = z.input<typeof createJobSchema>;

// ── Props ──

interface JobCreationFormProps {
  onSuccess: (job: JobDetail) => void;
}

// ── Component ──

export function JobCreationForm({ onSuccess }: JobCreationFormProps) {
  const createJobMutation = useCreateJob();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobFormInput, unknown, CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      account_id: undefined,
      service_address: "",
      job_type: "cleaning",
      scheduled_start: undefined,
      scheduled_end: undefined,
      estimated_hours: undefined,
      assigned_to: [],
      special_instructions: "",
      notes: "",
    },
  });

  // Watch start/end dates for cross-validation constraints
  const watchedStart = watch("scheduled_start");
  const watchedEnd = watch("scheduled_end");

  const handleAccountSelect = useCallback(
    (accountId: string, account: AccountListItem) => {
      setValue("account_id", accountId);
      // Pre-fill address from account
      if (account.address) {
        setValue("service_address", account.address);
      }
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data: CreateJobFormData) => {
      try {
        const payload = {
          title: data.title,
          service_address: data.service_address,
          account_id: data.account_id,
          job_type: data.job_type,
          scheduled_start: data.scheduled_start,
          scheduled_end: data.scheduled_end,
          estimated_hours: data.estimated_hours,
          assigned_to: data.assigned_to.length > 0 ? data.assigned_to : undefined,
          special_instructions: data.special_instructions || undefined,
          notes: data.notes || undefined,
        };
        if (__DEV__) {
          console.log("[JobCreation] Payload:", JSON.stringify(payload, null, 2));
        }
        const job = await createJobMutation.mutateAsync(payload);
        onSuccess(job);
      } catch (err) {
        if (__DEV__) {
          console.error("[JobCreation] Error creating job:", err);
        }
        if (err instanceof ApiError) {
          switch (err.code) {
            case "RATE_LIMITED":
              showToast("error", "Too many requests. Please wait and try again.");
              break;
            case "PERMISSION_DENIED":
            case "INVALID_CREDENTIALS":
              showToast("error", "You don't have permission to create jobs.");
              break;
            case "VALIDATION_ERROR": {
              const fieldErrors = err.details
                ?.map((d) => `${d.path}: ${d.message}`)
                .join("\n");
              showToast(
                "error",
                fieldErrors || err.message || "Validation failed."
              );
              break;
            }
            case "NOT_FOUND":
              showToast(
                "error",
                err.message || "A referenced record was not found."
              );
              break;
            default:
              showToast("error", err.message || "Failed to create job.");
          }
          if (__DEV__) {
            console.error(
              `[JobCreation] ApiError code=${err.code} status=${err.status} message=${err.message}`,
              err.details
            );
          }
        } else if (err instanceof TypeError) {
          // Network / CORS / fetch failures throw TypeError
          showToast(
            "error",
            "Network error — check your connection and try again."
          );
        } else {
          const message =
            err instanceof Error ? err.message : "Unknown error occurred.";
          showToast("error", message);
        }
      }
    },
    [createJobMutation, onSuccess]
  );

  return (
    <View className="px-4 gap-5">
      {/* 1. Title */}
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Job Title *"
            placeholder="e.g. Office Deep Clean"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title?.message}
            leftIcon={
              <FontAwesomeIcon
                icon={faBriefcase}
                size={16}
                color={colors.text.secondary}
              />
            }
          />
        )}
      />

      {/* 2. Account Picker */}
      <Controller
        control={control}
        name="account_id"
        render={({ field: { value } }) => (
          <AccountPicker
            value={value}
            onChange={handleAccountSelect}
            error={errors.account_id?.message}
          />
        )}
      />

      {/* 3. Service Address */}
      <Controller
        control={control}
        name="service_address"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Service Address *"
            placeholder="Enter job location"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.service_address?.message}
            leftIcon={
              <FontAwesomeIcon
                icon={faLocationDot}
                size={16}
                color={colors.text.secondary}
              />
            }
          />
        )}
      />

      {/* 4. Service Type */}
      <Controller
        control={control}
        name="job_type"
        render={({ field: { onChange, value } }) => (
          <ServiceTypePicker
            value={value ?? "cleaning"}
            onChange={onChange}
            error={errors.job_type?.message}
          />
        )}
      />

      {/* 5. Date/Time Row */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Controller
            control={control}
            name="scheduled_start"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="Start Date/Time"
                value={value}
                onChange={onChange}
                error={errors.scheduled_start?.message}
                maxDate={watchedEnd}
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            control={control}
            name="scheduled_end"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="End Date/Time"
                value={value}
                onChange={onChange}
                error={errors.scheduled_end?.message}
                minDate={watchedStart}
              />
            )}
          />
        </View>
      </View>

      {/* 6. Estimated Hours */}
      <Controller
        control={control}
        name="estimated_hours"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Estimated Hours"
            placeholder="e.g. 2.5"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="decimal-pad"
            error={errors.estimated_hours?.message}
            leftIcon={
              <FontAwesomeIcon
                icon={faClock}
                size={16}
                color={colors.text.secondary}
              />
            }
          />
        )}
      />

      {/* 7. Team Assignment */}
      <Controller
        control={control}
        name="assigned_to"
        render={({ field: { onChange, value } }) => (
          <TeamAssignment
            selectedIds={value ?? []}
            onChange={onChange}
            error={errors.assigned_to?.message}
          />
        )}
      />

      {/* 8. Special Instructions */}
      <View className="gap-1">
        <Text className="text-sm font-medium text-text-primary mb-1">
          Special Instructions
        </Text>
        <Controller
          control={control}
          name="special_instructions"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="bg-white border border-border rounded-[16px] px-4 py-3">
              <TextInput
                className="text-base text-text-primary"
                placeholder="Any special instructions for this job..."
                placeholderTextColor="#6B7280"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 72 }}
              />
            </View>
          )}
        />
        {errors.special_instructions?.message && (
          <Text className="text-xs text-error mt-1">
            {errors.special_instructions.message}
          </Text>
        )}
      </View>

      {/* 9. Notes */}
      <View className="gap-1">
        <Text className="text-sm font-medium text-text-primary mb-1">
          Internal Notes
        </Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="bg-white border border-border rounded-[16px] px-4 py-3">
              <TextInput
                className="text-base text-text-primary"
                placeholder="Internal notes (not visible to client)..."
                placeholderTextColor="#6B7280"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 72 }}
              />
            </View>
          )}
        />
        {errors.notes?.message && (
          <Text className="text-xs text-error mt-1">
            {errors.notes.message}
          </Text>
        )}
      </View>

      {/* 10. Submit */}
      <View className="mt-2 mb-6">
        <Button
          title="Create Job"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="lg"
          loading={isSubmitting || createJobMutation.isPending}
          disabled={isSubmitting || createJobMutation.isPending}
        />
      </View>
    </View>
  );
}
