'use client';

// The SDK touches window, so keep it client-only.
import { embedded } from '@salla.sa/embedded-sdk';

export function initSallaEmbedded() {
  // Some builds expose init/ready
  if (typeof window === 'undefined') return;

  try {
    // initialize bridge with Salla dashboard
    // (safe even if called multiple times)
    (embedded as any).init?.();
    (embedded as any).ready?.();
  } catch (e) {
    // swallow to avoid breaking the iframe UI
    console.error('Salla Embedded SDK init failed:', e);
  }
}

export function getSallaEmbedded() {
  return embedded as any;
}
