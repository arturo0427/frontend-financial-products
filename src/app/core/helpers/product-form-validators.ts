import { AbstractControl, ValidationErrors } from '@angular/forms';

export function addOneYearIso(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map((v) => Number(v));
  const date = new Date(y, m - 1, d);
  date.setFullYear(date.getFullYear() + 1);

  const yy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function releaseDateNotPastValidator(
  control: AbstractControl<string>,
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  return value >= todayLocalIso() ? null : { dateInPast: true };
}

export function revisionOneYearAfterValidator(
  control: AbstractControl<string>,
): ValidationErrors | null {
  const group = control.parent;
  const release = group?.get('date_release')?.value as string | null;
  const revision = control.value;

  if (!release || !revision) return null;

  const expected = addOneYearIso(release);
  return revision === expected ? null : { notOneYearAfter: true };
}

function todayLocalIso(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

