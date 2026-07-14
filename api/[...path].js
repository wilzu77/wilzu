export default async function handler(req, res) {
  const target = "https://www.ivasms.com";

  try {
    // Bangun URL target
    const url = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = new URL(url.pathname + url.search, target);

    // Siapkan headers (cuma hapus host biar gak konflik)
    const headers = { ...req.headers };
    delete headers.host;

    // Siapkan body
    let body = req.body;
    if (req.method === 'GET' || req.method === 'HEAD') {
      body = undefined;
    }

    // Kirim request ke IVASMS
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });

    // Baca response
    const data = await response.text();

    // Kirim balik
    res.status(response.status).send(data);

  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
}
