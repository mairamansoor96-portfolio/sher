// The couplet balancing rule (SPEC.md, "Couplet typography"), as pure maths so
// the page and the poster maker can share it.

/** Above this much extra space, the shorter line stays natural and centred. */
export const MAX_STRETCH = 0.4;

/** Room kept free beside the wider line, for Nastaliq swashes that overhang. */
export const SAFETY = 0.03;

export interface Balance {
  /** Multiply the base font size by this (≤ 1). Both lines always share it. */
  scale: number;
  /** Shared line width at the scaled size, in the same units as the inputs. */
  width: number;
  /** Whether the shorter line is stretched to `width` (else natural, centred). */
  stretch: boolean;
}

/**
 * @param widths natural widths of the two lines at the base font size
 * @param available width the couplet may occupy
 */
export function balance(widths: readonly [number, number], available: number): Balance {
  const wider = Math.max(...widths);
  const shorter = Math.min(...widths);
  if (wider <= 0 || available <= 0) return { scale: 1, width: wider, stretch: false };

  const room = available * (1 - SAFETY);
  const scale = Math.min(1, room / wider);
  // Font size changes stretch both lines equally, so the ratio is scale-free.
  const stretch = shorter > 0 && wider / shorter - 1 <= MAX_STRETCH;
  return { scale, width: wider * scale, stretch };
}
