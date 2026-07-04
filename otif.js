/** Shared OTIF calculation helpers */

export function computeOtifFlags(promised_date, actual_date, ordered_quantity, delivered_quantity) {
  const is_on_time = actual_date && promised_date ? actual_date <= promised_date : false;
  const is_in_full =
    ordered_quantity != null && delivered_quantity != null && Number(ordered_quantity) > 0
      ? Number(delivered_quantity) >= Number(ordered_quantity)
      : false;
  const is_otif = is_on_time && is_in_full;
  return { is_on_time, is_in_full, is_otif };
}

export function calcStats(deliveries) {
  const total = deliveries.length;
  const otif = deliveries.filter(d => d.is_otif).length;
  const onTime = deliveries.filter(d => d.is_on_time).length;
  const inFull = deliveries.filter(d => d.is_in_full).length;
  return {
    total,
    otif,
    onTime,
    inFull,
    otifPct: total ? (otif / total) * 100 : 0,
    onTimePct: total ? (onTime / total) * 100 : 0,
    inFullPct: total ? (inFull / total) * 100 : 0,
  };
}