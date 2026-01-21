export interface CreateFinancialProductPayload {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface UpdateFinancialProductPayload {
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}
