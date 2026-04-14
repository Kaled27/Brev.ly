import z from "zod";

export type PaginationParams = {
  page: number;
  page_size: number;
};

export type PaginationMeta = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export const pagyResponseSchema = z.object({
  page: z
    .number()
    .int()
    .min(1)
    .meta({ examples: [1] }),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(100)
    .meta({ examples: [10] }),
  total: z
    .number()
    .int()
    .nonnegative()
    .meta({ examples: [47] }),
  total_pages: z
    .number()
    .int()
    .nonnegative()
    .meta({ examples: [5] }),
});

export function resolvePagination(
  params: PaginationParams,
  total: number,
): { offset: number; meta: PaginationMeta } {
  const { page, page_size } = params;
  const offset = (page - 1) * page_size;
  const meta: PaginationMeta = {
    page,
    page_size,
    total,
    total_pages: total === 0 ? 0 : Math.ceil(total / page_size),
  };
  return { offset, meta };
}
