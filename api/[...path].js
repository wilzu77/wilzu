export default async function handler(req, res) {
  const target = "https://www.ivasms.com";
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = new URL(url.pathname + url.search, target);
    const headers = { ...req.headers };
    const blockedHeaders = [
      'host', 'content-length', 'connection', 
      'accept-encoding', 'transfer-encoding', 
      'expect', 'upgrade', 'sec-websocket-key'
    ];
    blockedHeaders.forEach(h => delete headers[h]);
    headers.referer = target;
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers['content-type'] || '';  
      if (contentType.includes('application/json')) {
        body = req.body;
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        if (req.body && typeof req.body === 'object') {
          body = new URLSearchParams(req.body).toString();
          headers['content-type'] = 'application/x-www-form-urlencoded';
        } else {
          body = req.body;
        }
      } else {
        body = req.body;
      }
    }
    console.log(`[PROXY] ${req.method} ${targetUrl.toString()}`);
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'manual', 
    });
    if (response.status === 301 || response.status === 302 || response.status === 303) {
      const location = response.headers.get('location');
      console.log(`[PROXY] Redirect to: ${location}`);
      if (location && !location.startsWith('http')) {
        const redirectUrl = new URL(location, target);
        return res.redirect(redirectUrl.toString());
      }
      return res.redirect(location);
    }
    const data = await response.text();
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key)) {
        responseHeaders[key] = value;
      }
    });
    responseHeaders['Access-Control-Allow-Origin'] = '*';
    responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN';
    
    // PERBAIKAN: ganti res.set() dengan res.setHeader()
    res.status(response.status);
    Object.keys(responseHeaders).forEach(key => res.setHeader(key, responseHeaders[key]));
    res.send(data);

  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export async function OPTIONS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
  res.status(200).end();
}
