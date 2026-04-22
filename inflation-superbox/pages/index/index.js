const api = require('../../utils/api')
const u = require('../../utils/util')

Page({
  data: {
    loading: true,
    error: '',
    // market anchors (今日真实市场)
    anchorGold: '--',
    anchorDxy: '--',
    anchorSpx: '--',
    anchorUst: '--',
    // header
    asOf: '--',
    pi: '--',
    piClass: 'text-gold',
    delta1d: '--',
    delta1dClass: 'text-dim',
    regimeLabel: '--',
    regimeBadgeClass: 'badge-neutral',
    regimeEmoji: '',
    // components IPS bars
    components: [],
    // inflation type (diagnosis)
    typeLabel: '--',
    typeWeight: '--',
    persistence: '--',
    policyResponse: '--',
    // four-asset tower
    assets: [],
  },

  onLoad() { this.loadData() },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  async loadData() {
    this.setData({ loading: true, error: '' })
    try {
      const [score, assets, diag, anchors] = await Promise.all([
        api.fetchScore(),
        api.fetchAssets(),
        api.fetchDiagnosis(),
        api.fetchMarketAnchors().catch(() => null),
      ])

      // Components stacked bars
      const keyMeta = {
        P: { label: 'P 价格', color: '#F59E0B', weight: 25 },
        E: { label: 'E 预期', color: '#0EA5E9', weight: 20 },
        D: { label: 'D 驱动', color: '#8B5CF6', weight: 20 },
        F: { label: 'F 财政', color: '#F43F5E', weight: 15 },
        N: { label: 'N 叙事', color: '#14B8A6', weight: 20 },
      }
      const components = ['P', 'E', 'D', 'F', 'N'].map((k) => {
        const val = (score.components || {})[k] || 0
        return {
          key: k,
          label: keyMeta[k].label,
          weight: keyMeta[k].weight,
          color: keyMeta[k].color,
          score: Math.round(val),
        }
      })

      // Four-asset tower
      const assetRows = (assets.assets || []).map((a) => {
        const delta = a.suggested_weight.delta_pp
        return {
          key: a.key,
          name: a.name_zh,
          ticker: a.ticker,
          emoji: a.emoji,
          direction: a.direction,
          directionLabel: u.directionLabel(a.direction),
          directionBadgeClass: u.directionBadgeClass(a.direction),
          confidence: Math.round(a.confidence),
          headline: a.headline,
          chain: a.rationale_chain,
          sensitivity: Math.round((a.sensitivity || 0) * 100),
          analog: (a.historical_analog || {}).period || '--',
          similarity: ((a.historical_analog || {}).similarity || 0).toFixed(2),
          risk: a.risk,
          currentPct: Math.round((a.suggested_weight.current || 0) * 100),
          neutralPct: Math.round((a.suggested_weight.neutral || 0) * 100),
          delta,
          deltaText: (delta > 0 ? '+' : '') + delta + 'pp',
          deltaClass: delta > 0 ? 'text-green' : delta < 0 ? 'text-red' : 'text-dim',
        }
      })

      // Diagnosis
      const typeMap = {
        demand_pull: '需求拉动',
        cost_push: '成本推动',
        wage_price: '工资-物价螺旋',
        fiscal_driven: '财政驱动',
        mixed: '混合型',
      }
      const persistMap = { low: '低', medium: '中等', high: '高' }

      this.setData({
        loading: false,
        anchorGold: anchors ? '$' + Math.round(anchors.gold) : '--',
        anchorDxy: anchors ? Number(anchors.dxy).toFixed(2) : '--',
        anchorSpx: anchors ? String(Math.round(anchors.spx)) : '--',
        anchorUst: anchors ? Number(anchors.ust10y).toFixed(2) + '%' : '--',
        asOf: score.as_of || '--',
        pi: u.formatNumber(score.pi, 1),
        piClass: u.regimeColor(score.regime) ? '' : 'text-gold',
        delta1d: u.formatSigned(score.delta_1d, 1),
        delta1dClass: u.deltaClass(score.delta_1d),
        regimeLabel: u.regimeLabel(score.regime),
        regimeBadgeClass: u.regimeBadgeClass(score.regime),
        regimeEmoji: u.regimeEmoji(score.regime),
        components,
        typeLabel: typeMap[diag.dominant_type] || '--',
        typeWeight: Math.round((diag.dominant_weight || 0) * 100) + '%',
        persistence: persistMap[diag.persistence] || '--',
        policyResponse: persistMap[diag.policy_responsiveness] || '--',
        assets: assetRows,
      })
    } catch (err) {
      console.error('index loadData failed', err)
      this.setData({ loading: false, error: '加载失败: ' + (err && err.message || err) })
    }
  },
})
