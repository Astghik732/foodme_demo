import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@/api/client";
import { foodmeApi } from "@/api/foodme";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { StarRatingInput } from "@/components/sections/star-rating";
import { MAX_RATING_COMMENT_LENGTH, ratingSchema, type RatingFormValues } from "@/schemas/rating-schema";

interface OrderRatingDialogProps {
  orderNumber: string;
  chefName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderRatingDialog({ orderNumber, chefName, open, onOpenChange }: OrderRatingDialogProps) {
  const queryClient = useQueryClient();
  const starsLabelId = useId();
  const commentId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { stars: 0, comment: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: RatingFormValues) =>
      foodmeApi.rateOrder(orderNumber, {
        stars: values.stars,
        comment: values.comment.trim() === "" ? undefined : values.comment.trim(),
      }),
    onSuccess: async () => {
      // The order list/tracking show the stars, and the chef's average changed.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", orderNumber] }),
        queryClient.invalidateQueries({ queryKey: ["chef"] }),
        queryClient.invalidateQueries({ queryKey: ["chefs"] }),
      ]);
      reset({ stars: 0, comment: "" });
      setSubmitError(null);
      onOpenChange(false);
    },
    onError: (error) => {
      setSubmitError(error instanceof ApiRequestError ? error.message : "Could not save your rating. Try again.");
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (mutation.isPending) return;
    if (!next) {
      reset({ stars: 0, comment: "" });
      setSubmitError(null);
    }
    onOpenChange(next);
  };

  const commentLength = watch("comment")?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogTitle className="font-display pr-10 text-xl font-bold text-zinc-900">Rate your order</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-zinc-500">
          Order {orderNumber}
          {chefName ? ` · ${chefName}` : ""}
        </DialogDescription>

        <form
          aria-label="Rate order"
          noValidate
          className="mt-5 flex flex-col gap-5"
          onSubmit={handleSubmit((values) => {
            setSubmitError(null);
            mutation.mutate(values);
          })}
        >
          <div className="flex flex-col gap-1.5">
            <span id={starsLabelId} className="text-sm font-semibold text-zinc-900">
              Your rating
            </span>
            <Controller
              control={control}
              name="stars"
              render={({ field }) => (
                <StarRatingInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={mutation.isPending}
                  aria-labelledby={starsLabelId}
                />
              )}
            />
            {errors.stars && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {errors.stars.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={commentId} className="text-sm font-semibold text-zinc-900">
              Comment <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <textarea
              id={commentId}
              rows={4}
              placeholder="Tell us about your order"
              disabled={mutation.isPending}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 hover:border-zinc-300 focus-visible:border-zinc-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-100 disabled:opacity-50"
              {...register("comment")}
            />
            <div className="flex items-start justify-between gap-3">
              <p role="alert" className="text-xs font-medium text-red-600">
                {errors.comment?.message}
              </p>
              <span
                className={`shrink-0 text-xs tabular-nums ${commentLength > MAX_RATING_COMMENT_LENGTH ? "text-red-600" : "text-zinc-400"}`}
              >
                {commentLength}/{MAX_RATING_COMMENT_LENGTH}
              </span>
            </div>
          </div>

          {submitError && (
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : submitError ? "Try again" : "Submit rating"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
