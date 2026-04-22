/** Formatting + styling helpers for Inflation Monitor SuperBox. */

function formatNumber(n, decimals) {
  if (n == null || isNaN(n)) return '--'
  decimals = decimals != null ? decimals : 2
  return Number(n).toFixed(decimals)
}

function formatSignedPct(n, decimals) {
  if (n == null || isNaN(n)) return '--'
  decimals = decimals != null ? decimals : 1
  var prefix = n > 0 ? '+' : ''
  return prefix + Number(n).toFixed(decimals) + '%'
}

function formatSigned(n, decimals) {
  if (n == null || isNaN(n)) return '--'
  decimals = decimals != null ? decimals : 1
  var prefix = n > 0 ? '+' : ''
  return prefix + Number(n).toFixed(decimals)
}

/* ═══ Regime (5 levels) ═══ */
var REGIME_META = {
  reflation_surge:  { label: '再加速',   emoji: '🔴', badgeClass: 'badge-reflation',    color: '#EF4444' },
  sticky_inflation: { label: '粘性通胀', emoji: '🟠', badgeClass: 'badge-sticky',       color: '#F97316' },
  goldilocks:       { label: '温和通胀', emoji: '🟡', badgeClass: 'badge-goldilocks',   color: '#EAB308' },
  disinflation:     { label: '通胀回落', emoji: '🟢', badgeClass: 'badge-disinflation', color: '#10B981' },
  deflation_risk:   { label: '通缩风险', emoji: '🔵', badgeClass: 'badge-deflation',    color: '#3B82F6' },
}
function regimeLabel(k)      { return (REGIME_META[k] || {}).label || '--' }
function regimeEmoji(k)      { return (REGIME_META[k] || {}).emoji || '' }
function regimeBadgeClass(k) { return (REGIME_META[k] || {}).badgeClass || 'badge-neutral' }
function regimeColor(k)      { return (REGIME_META[k] || {}).color || '#64748B' }

/* ═══ Direction (asset signals) ═══ */
var DIRECTION_META = {
  BULLISH:  { label: '看多', badgeClass: 'badge-bullish' },
  NEU_BULL: { label: '偏多', badgeClass: 'badge-neu-bull' },
  NEUTRAL:  { label: '中性', badgeClass: 'badge-neutral' },
  NEU_BEAR: { label: '偏空', badgeClass: 'badge-neu-bear' },
  BEARISH:  { label: '看空', badgeClass: 'badge-bearish' },
}
function directionLabel(d)      { return (DIRECTION_META[d] || {}).label || '--' }
function directionBadgeClass(d) { return (DIRECTION_META[d] || {}).badgeClass || 'badge-neutral' }

/* ═══ Hawk-dove (-2..2) ═══ */
function hawkLabel(s) {
  var map = { '-2': '极鸽', '-1': '偏鸽', '0': '中性', '1': '偏鹰', '2': '极鹰' }
  return map[String(s)] || '中性'
}
function hawkBadgeClass(s) {
  var map = { '-2': 'badge-dove2', '-1': 'badge-dove1', '0': 'badge-dove0', '1': 'badge-hawk1', '2': 'badge-hawk2' }
  return map[String(s)] || 'badge-dove0'
}

/* ═══ Delta arrow / color ═══ */
function deltaClass(n) {
  if (n == null || isNaN(n)) return 'text-dim'
  if (n > 0) return 'text-red'        // IPS 涨 = 通胀压力↑ (用红表示)
  if (n < 0) return 'text-green'
  return 'text-dim'
}

/* ═══ Tone (sub-factor): push / suppress / neutral ═══ */
function toneColor(tone) {
  if (tone === 'push') return '#EF4444'
  if (tone === 'suppress') return '#10B981'
  return '#F59E0B'
}

module.exports = {
  formatNumber,
  formatSignedPct,
  formatSigned,
  regimeLabel, regimeEmoji, regimeBadgeClass, regimeColor,
  directionLabel, directionBadgeClass,
  hawkLabel, hawkBadgeClass,
  deltaClass,
  toneColor,
}
