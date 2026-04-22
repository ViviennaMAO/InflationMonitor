const api = require('../../utils/api')
const u = require('../../utils/util')

const ASSET_META = {
  gold: { emoji: '🟡', label: '黄金' },
  usd:  { emoji: '💵', label: '美元' },
  ust:  { emoji: '📉', label: '美债' },
  spx:  { emoji: '📈', label: '美股' },
}

Page({
  data: {
    loading: true,
    error: '',
    asOf: '--',
    currentKey: '',
    pills: [],       // [{key, label, emoji, probPct, isCurrent, pillClass}]
    active: null,    // currently shown scenario detail
  },

  onLoad() { this.loadData() },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },
  onPullDownRefresh() { this.loadData().then(() => wx.stopPullDownRefresh()) },

  async loadData() {
    this.setData({ loading: true, error: '' })
    try {
      const bundle = await api.fetchScenarios()
      const scenarios = bundle.scenarios || []
      const currentKey = bundle.current_regime

      const pills = scenarios.map((s) => ({
        key: s.key,
        label: s.label,
        emoji: s.emoji,
        probPct: Math.round((s.probability || 0) * 100),
        isCurrent: s.is_current,
      }))

      // initial: show current
      this._raw = scenarios
      this.setData({
        loading: false,
        asOf: bundle.as_of || '--',
        currentKey,
        pills,
      })
      this.showScenario(currentKey)
    } catch (err) {
      this.setData({ loading: false, error: '加载失败: ' + (err && err.message || err) })
    }
  },

  onPillTap(e) {
    const key = e.currentTarget.dataset.key
    this.showScenario(key)
  },

  showScenario(key) {
    const s = (this._raw || []).find((x) => x.key === key)
    if (!s) return

    const performance = (s.performance || []).map((p) => {
      const meta = ASSET_META[p.asset] || {}
      const lo = p.return_range ? p.return_range[0] : 0
      const hi = p.return_range ? p.return_range[1] : 0
      // map -25..+25 to 0..100 for bar positioning
      const clampPct = (n) => Math.max(0, Math.min(100, (n + 25) / 50 * 100))
      const left = clampPct(lo)
      const width = Math.max(3, clampPct(hi) - left)
      const barColor = hi > 0 && lo >= 0 ? '#10B981' : lo < 0 && hi <= 0 ? '#EF4444' : '#F59E0B'
      return {
        asset: p.asset,
        label: meta.label,
        emoji: meta.emoji,
        loText: (lo > 0 ? '+' : '') + lo + '%',
        hiText: (hi > 0 ? '+' : '') + hi + '%',
        barLeft: left,
        barWidth: width,
        barColor,
        direction: p.direction,
        directionLabel: u.directionLabel(p.direction),
        directionBadgeClass: u.directionBadgeClass(p.direction),
      }
    })

    const weights = (s.weights || []).map((w) => {
      const meta = ASSET_META[w.asset] || {}
      return {
        asset: w.asset,
        label: meta.label,
        emoji: meta.emoji,
        currentPct: Math.round((w.current || 0) * 100),
        neutralPct: Math.round((w.neutral || 0) * 100),
        delta: w.delta_pp,
        deltaText: (w.delta_pp > 0 ? '+' : '') + w.delta_pp + 'pp',
        deltaClass: w.delta_pp > 0 ? 'text-green' : w.delta_pp < 0 ? 'text-red' : 'text-dim',
        note: w.note,
      }
    })

    const exitPaths = (s.exit_paths || []).map((p) => ({
      path: p.path,
      weight: p.weight,
      weightPct: Math.round((p.weight || 0) * 100),
    }))

    const active = {
      key: s.key,
      label: s.label,
      emoji: s.emoji,
      badgeClass: u.regimeBadgeClass(s.key),
      probPct: Math.round((s.probability || 0) * 100),
      description: s.description,
      historical: (s.historical_analog || []).join(' · '),
      duration: s.median_duration_months,
      exitPaths,
      performance,
      weights,
      keyRisks: s.key_risks,
      isCurrent: s.is_current,
    }

    // recompute pill classes w/ active state
    const pills = this.data.pills.map((p) => ({
      ...p,
      pillClass: p.key === s.key ? 'pill pill-active' : 'pill',
    }))

    this.setData({ active, pills })
  },
})
