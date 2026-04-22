/** Fetch wrappers — talks to the Vercel-deployed InflationMonitor Next.js API. */
const app = getApp()

function request(path) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.apiBase + path,
      method: 'GET',
      dataType: 'json',
      timeout: 15000,
      success(res) {
        if (res.statusCode === 200) resolve(res.data)
        else reject(new Error('HTTP ' + res.statusCode))
      },
      fail(err) { reject(err) },
    })
  })
}

module.exports = {
  request,
  fetchScore:        () => request('/score'),
  fetchComponents:   () => request('/components'),
  fetchAssets:       () => request('/assets'),
  fetchScenarios:    () => request('/scenarios'),
  fetchDiagnosis:    () => request('/diagnosis'),
  fetchFomc:         () => request('/fomc'),
  fetchFiscal:       () => request('/fiscal'),
  fetchNarrative:    () => request('/narrative'),
  fetchEventWindow:  () => request('/event-window'),
  fetchSignalTimeline: () => request('/signal-timeline'),
}
