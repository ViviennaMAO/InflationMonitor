/** Fetch wrappers — talks to the Vercel-deployed InflationMonitor Next.js API.
 *
 * Notes on reliability:
 * - Vercel cold starts can take 3-10s on the free tier. SuperBox IDE's
 *   network stack also tends to be slower than browsers/curl. We use a
 *   30s timeout (was 15s) plus one auto-retry to absorb cold-start tax.
 * - Use `requestSeq()` (sequential) for first-load to avoid 4+ parallel
 *   cold starts stacking up. Subsequent loads can use `Promise.all`.
 */
const app = getApp()

const TIMEOUT_MS = 30000  // 30s — covers Vercel cold start + IDE overhead
const RETRY_DELAY_MS = 800

function _doRequest(path) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.apiBase + path,
      method: 'GET',
      dataType: 'json',
      timeout: TIMEOUT_MS,
      success(res) {
        if (res.statusCode === 200) resolve(res.data)
        else reject(new Error('HTTP ' + res.statusCode))
      },
      fail(err) { reject(err) },
    })
  })
}

/** Single request with one auto-retry on timeout/network failure. */
function request(path) {
  return _doRequest(path).catch((err) => {
    const msg = (err && (err.errMsg || err.message)) || ''
    if (msg.indexOf('timeout') >= 0 || msg.indexOf('fail') >= 0) {
      // Wait briefly, then retry once. Cold-started Vercel function should
      // be warm by now.
      console.warn('[api] retrying', path, 'after', msg)
      return new Promise((r) => setTimeout(r, RETRY_DELAY_MS)).then(() => _doRequest(path))
    }
    throw err
  })
}

/** Sequential fetch helper — for first-load to avoid cold-start stacking. */
async function requestSeq(paths) {
  const out = []
  for (const p of paths) out.push(await request(p))
  return out
}

module.exports = {
  request,
  requestSeq,
  fetchScore:        () => request('/score'),
  fetchComponents:   () => request('/components'),
  fetchAssets:       () => request('/assets'),
  fetchScenarios:    () => request('/scenarios'),
  fetchDiagnosis:    () => request('/diagnosis'),
  fetchFomc:         () => request('/fomc'),
  fetchFiscal:       () => request('/fiscal'),
  fetchNarrative:    () => request('/narrative'),
  fetchEventWindow:  () => request('/event-window'),
  fetchMarketAnchors:() => request('/market-anchors'),
  fetchSignalTimeline: () => request('/signal-timeline'),
}
