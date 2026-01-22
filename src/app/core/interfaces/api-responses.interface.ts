export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiEntityResponse<T> {
  message: string;
  data: T;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  name?: string;
  message?: string;
  errors?: unknown;
}



