
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductsService } from './products.service';
import { API } from '../constants/api.constants';
import { FinancialProduct } from '../interfaces/financial-product.interface';
import {
  ApiEntityResponse,
  ApiListResponse,
  ApiMessageResponse,
} from '../interfaces/api-responses.interface';
import {
  CreateFinancialProductPayload,
  UpdateFinancialProductPayload,
} from '../interfaces/products-payloads.interface';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  const baseUrl = API.baseUrl;
  const productsUrl = `${baseUrl}${API.products}`;

  const productMock: FinancialProduct = {
    id: 'trj-crd',
    name: 'Tarjeta de Crédito',
    description: 'Producto financiero para compras y pagos.',
    logo: 'https://example.com/logo.png',
    date_release: '2026-01-01',
    date_revision: '2027-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should GET list and map res.data', () => {
      const apiResponse: ApiListResponse<FinancialProduct> = {
        data: [productMock],
      };

      let result: FinancialProduct[] | undefined;

      service.getAll().subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(productsUrl);
      expect(req.request.method).toBe('GET');

      req.flush(apiResponse);

      expect(result).toEqual([productMock]);
    });
  });

  describe('getById', () => {
    it('should GET entity by id and map res.data', () => {
      const id = 'trj-crd';

      const apiResponse: ApiEntityResponse<FinancialProduct> = {
        message: 'OK',
        data: productMock,
      };

      let result: FinancialProduct | undefined;

      service.getById(id).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(`${baseUrl}${API.productById(id)}`);
      expect(req.request.method).toBe('GET');

      req.flush(apiResponse);

      expect(result).toEqual(productMock);
    });
  });

  describe('create', () => {
    it('should POST payload and map res.data', () => {
      const payload: CreateFinancialProductPayload = {
        id: 'new-prd',
        name: 'Nuevo producto',
        description: 'Descripción del nuevo producto.',
        logo: 'https://example.com/new.png',
        date_release: '2026-02-01',
        date_revision: '2027-02-01',
      };

      const created: FinancialProduct = { ...payload };

      const apiResponse: ApiEntityResponse<FinancialProduct> = {
        message: 'Created',
        data: created,
      };

      let result: FinancialProduct | undefined;

      service.create(payload).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(productsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(apiResponse);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should PUT payload to productById and map res.data', () => {
      const id = 'trj-crd';

      const payload: UpdateFinancialProductPayload = {
        name: 'Tarjeta de Crédito (Actualizada)',
        description: 'Actualización de descripción.',
        logo: 'https://example.com/logo2.png',
        date_release: '2026-01-01',
        date_revision: '2027-01-01',
      };

      const updated: FinancialProduct = { id, ...payload };

      const apiResponse: ApiEntityResponse<FinancialProduct> = {
        message: 'Updated',
        data: updated,
      };

      let result: FinancialProduct | undefined;

      service.update(id, payload).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(`${baseUrl}${API.productById(id)}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);

      req.flush(apiResponse);

      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should DELETE productById and return void', () => {
      const id = 'trj-crd';

      let result: void | undefined;

      service.remove(id).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(`${baseUrl}${API.productById(id)}`);
      expect(req.request.method).toBe('DELETE');

      const apiResponse: ApiMessageResponse = {
        message: 'Deleted',
      };

      req.flush(apiResponse);

      expect(result).toBeUndefined();
    });
  });

  describe('verifyIdExists', () => {
    it('should GET verification endpoint and return boolean', () => {
      const id = 'trj-crd';

      let result: boolean | undefined;

      service.verifyIdExists(id).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(
        `${baseUrl}${API.productVerification(id)}`,
      );
      expect(req.request.method).toBe('GET');

      req.flush(true);

      expect(result).toBeTrue();
    });
  });
});

