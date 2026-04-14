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
