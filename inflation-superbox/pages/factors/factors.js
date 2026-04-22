const api = require('../../utils/api')
const u = require('../../utils/util')

const KEY_STYLES = {
  P: { color: '#F59E0B' },
  E: { color: '#0EA5E9' },
  D: { color: '#8B5CF6' },
  F: { color: '#F43F5E' },
  N: { color: '#14B8A6' },
}

Page({
  data: {
    loading: true,
    error: '',
    components: [],
  },

  onLoad() { this.loadData() },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },
  onPullDownRefresh() { this.loadData().then(() => wx.stopPullDownRefresh()) },

  async loadData() {
    this.setData({ loading: true, error: '' })
    try {
      const list = await api.fetchComponents()
      const components = (list || []).map((c) => {
        const color = (KEY_STYLES[c.key] || {}).color || '#9CA3AF'
        const factors = (c.sub_factors || []).map((f) => {
          const unit = f.unit == null ? '' : f.unit
          var valStr
          if (typeof f.value === 'number') {
            const sign = f.value > 0 && unit === '%' ? '+' : ''
            valStr = sign + Number(f.value).toFixed(Math.abs(f.value) >= 100 ? 0 : 2) + unit
          } else {
            valStr = '--'
          }
          return {
            key: f.key,
            label: f.label,
            valStr,
            score: Math.round(f.score || 0),
            barColor: u.toneColor(f.tone),
          }
        })
        return {
          key: c.key,
          labelZh: c.label_zh,
          label: c.label,
          score: Math.round(c.score || 0),
          weight: Math.round((c.weight || 0) * 100),
          color,
          headline: c.headline,
          annotation: c.annotation,
          factors,
        }
      })
      this.setData({ loading: false, components })
    } catch (err) {
      this.setData({ loading: false, error: '加载失败: ' + (err && err.message || err) })
    }
  },
})
