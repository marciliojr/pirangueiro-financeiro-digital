import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
}

export function toUpperCase(text: string | undefined | null): string {
  return text ? text.toUpperCase() : '';
}

export function handleUpperCaseInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
  const element = e.target;
  if (element.type !== 'password' && element.type !== 'email' && element.type !== 'number' && element.type !== 'date') {
    const start = element.selectionStart;
    const end = element.selectionEnd;
    element.value = element.value.toUpperCase();
    element.setSelectionRange(start, end);
  }
  return e;
}
