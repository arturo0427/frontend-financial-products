import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import {
  ApiEntityResponse,
  ApiListResponse,
  ApiMessageResponse,
} from '../interfaces/api-responses.interface';
import { FinancialProduct } from '../interfaces/financial-product.interface';
import {
  CreateFinancialProductPayload,
  UpdateFinancialProductPayload,
} from '../interfaces/products-payloads.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly _http = inject(HttpClient);

  getAll(): Observable<FinancialProduct[]> {
    return this._http
      .get<ApiListResponse<FinancialProduct>>(`${API.baseUrl}${API.products}`)
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<FinancialProduct> {
    return this._http
      .get<ApiEntityResponse<FinancialProduct>>(
        `${API.baseUrl}${API.productById(id)}`,
      )
      .pipe(map((res) => res.data));
  }

  create(payload: CreateFinancialProductPayload): Observable<FinancialProduct> {
    return this._http
      .post<
        ApiEntityResponse<FinancialProduct>
      >(`${API.baseUrl}${API.products}`, payload)
      .pipe(map((res) => res.data));
  }

  update(
    id: string,
    payload: UpdateFinancialProductPayload,
  ): Observable<FinancialProduct> {
    return this._http
      .put<
        ApiEntityResponse<FinancialProduct>
      >(`${API.baseUrl}${API.productById(id)}`, payload)
      .pipe(map((res) => res.data));
  }

  remove(id: string): Observable<void> {
    return this._http
      .delete<ApiMessageResponse>(`${API.baseUrl}${API.productById(id)}`)
      .pipe(map(() => void 0));
  }

  verifyIdExists(id: string): Observable<boolean> {
    return this._http.get<boolean>(
      `${API.baseUrl}${API.productVerification(id)}`,
    );
  }
}


