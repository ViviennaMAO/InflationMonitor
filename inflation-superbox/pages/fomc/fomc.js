const api = require('../../utils/api')
const u = require('../../utils/util')

const TYPE_LABEL = {
  meeting: 'FOMC 会议',
  minutes: '会议纪要',
  speech: '官员发言',
}

Page({
  data: {
    loading: true,
    error: '',
    currentRate: '--',
    dotPlotMedian: '--',
    nextMeeting: '--',
    ma5: '--',
    ma5Class: 'text-muted',
    assessment: '--',
    timeline: [],
  },

  onLoad() { this.loadData() },
  onPullDownRefresh() { this.loadData().then(() => wx.stopPullDownRefresh()) },

  async loadData() {
    this.setData({ loading: true, error: '' })
    try {
      const b = await api.fetchFomc()

      const trend = b.hawkdove_trend || []
      const lastMa5 = trend.length ? trend[trend.length - 1].ma5 : null

      const timeline = (b.timeline || []).map((e) => ({
        date: e.date,
        type: e.type,
        typeLabel: TYPE_LABEL[e.type] || e.type,
        speaker: e.speaker || '',
        title: e.title,
        summary: e.summary,
        hawkdove: e.hawkdove,
        hawkLabel: u.hawkLabel(e.hawkdove),
        hawkBadgeClass: u.hawkBadgeClass(e.hawkdove),
        hasVote: e.has_vote,
        keyQuotes: e.key_quotes || [],
        rationale: e.rationale || '',
        confidence: e.confidence == null ? null : Math.round(e.confidence * 100),
      }))

      this.setData({
        loading: false,
        currentRate: u.formatNumber(b.current_rate, 3) + '%',
        dotPlotMedian: u.formatNumber(b.dot_plot_median, 3) + '%',
        nextMeeting: b.next_meeting || '--',
        ma5: lastMa5 == null ? '--' : u.formatSigned(lastMa5, 1),
        ma5Class: lastMa5 == null ? 'text-muted' : lastMa5 > 0 ? 'text-red' : 'text-blue',
        assessment: b.assessment || '--',
        timeline,
      })
    } catch (err) {
      this.setData({ loading: false, error: '加载失败: ' + (err && err.message || err) })
    }
  },
})
