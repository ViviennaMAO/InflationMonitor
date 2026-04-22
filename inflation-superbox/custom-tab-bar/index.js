Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '看板',
        icon: '/images/tab-dashboard.png',
        iconActive: '/images/tab-dashboard-active.png',
      },
      {
        pagePath: '/pages/factors/factors',
        text: '因子',
        icon: '/images/tab-factors.png',
        iconActive: '/images/tab-factors-active.png',
      },
      {
        pagePath: '/pages/scenarios/scenarios',
        text: '情景',
        icon: '/images/tab-scenarios.png',
        iconActive: '/images/tab-scenarios-active.png',
      },
      {
        pagePath: '/pages/fomc/fomc',
        text: 'FOMC',
        icon: '/images/tab-fomc.png',
        iconActive: '/images/tab-fomc-active.png',
      },
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
