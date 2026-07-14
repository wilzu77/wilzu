export default async function handler(req, res) {
  const target = "https://www.ivasms.com";
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = new URL(url.pathname + url.search, target);
    const headers = { ...req.headers };
    delete headers.host;
    let body = req.body;
    if (req.method === 'GET' || req.method === 'HEAD') body = undefined;
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
