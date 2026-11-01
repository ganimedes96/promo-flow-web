export interface ApiResponseError {
  requestId?: string;
  message: string;
  code: number;
  status: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface ApiResponsePaginated<T> {
  status: string;
  message: string;
  data: T;
  pagination: Pagination;
}

export interface Pagination {
  lastPage: number;
  perPage: number;
  total: number;
  page: number;
}

export interface PaginationParams {
  limit?: number;
  page: number;
}

export interface Filters {
  search?: string;
  status?: string;
  activeMunicipality?: boolean;
}
