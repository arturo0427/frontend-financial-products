import { environment } from '../../../environments/environment';

export const API = {
  baseUrl: environment.apiBaselocal,
  products: '/bp/products',
  productVerification: (id: string) =>
    `/bp/products/verification/${encodeURIComponent(id)}`,
  productById: (id: string) => `/bp/products/${encodeURIComponent(id)}`,
} as const;



