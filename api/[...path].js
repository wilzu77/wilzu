export default async function handler(req, res) {
  const target = "https://www.ivasms.com";

  try {
    // ========== BUILD TARGET URL ==========
    const url = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = new URL(url.pathname + url.search, target);

    // ========== PREPARE HEADERS ==========
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    // ========== PREPARE BODY ==========
    let body = req.body;
    if (req.method === 'GET' || req.method === 'HEAD') {
      body = undefined;
    }

    // ========== FETCH KE IVASMS ==========
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });

    // ========== BACA RESPONSE ==========
    const data = await response.text();

    // ========== KIRIM BALIK KE BOT ==========
    // Set status code
    res.status(response.status);

    // Set headers satu per satu pake setHeader()
    response.headers.forEach((value, key) => {
      // Skip header yang bermasalah
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key)) {
        res.setHeader(key, value);
      }
    });

    // Tambahin CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');

    // Kirim body
    res.send(data);

  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
}

// ========== HANDLE OPTIONS (CORS preflight) ==========
export async function OPTIONS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
  res.status(200).end();
}
