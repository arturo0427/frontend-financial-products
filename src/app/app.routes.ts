import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },

      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/products-list/products-list.component').then(
            (m) => m.ProductsListComponent,
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/pages/product-create/product-create.component').then(
            (m) => m.ProductCreateComponent,
          ),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/products/pages/product-edit/product-edit.component').then(
            (m) => m.ProductEditComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'products' },
];
