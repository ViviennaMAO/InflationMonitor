Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index',          text: '看板',   icon: '📊' },
      { pagePath: '/pages/factors/factors',      text: '因子',   icon: '📈' },
      { pagePath: '/pages/scenarios/scenarios',  text: '情景',   icon: '🎬' },
      { pagePath: '/pages/fomc/fomc',            text: 'FOMC',   icon: '🏛' },
    ],
  },
  methods: {
    onTap(e) {
      const idx = Number(e.currentTarget.dataset.index)
      const item = this.data.list[idx]
      if (!item || idx === this.data.selected) return
      wx.switchTab({ url: item.pagePath })
      this.setData({ selected: idx })
    },
  },
})
