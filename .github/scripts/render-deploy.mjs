const { RENDER_API_KEY, RENDER_SERVICE_ID, RENDER_IMAGE } = process.env;
if (!RENDER_API_KEY || !RENDER_SERVICE_ID || !RENDER_IMAGE) {
  throw new Error('Render API key, service ID, or image is missing');
}

const base = `https://api.render.com/v1/services/${encodeURIComponent(RENDER_SERVICE_ID)}/deploys`;
const headers = { Authorization: `Bearer ${RENDER_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' };

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`Render API returned HTTP ${response.status}`);
  return response.json();
}

const deploy = await request(base, { method: 'POST', body: JSON.stringify({ imageUrl: RENDER_IMAGE }) });
if (!deploy.id) throw new Error('Render did not return a deploy ID');
console.log(`Render deploy ${deploy.id} created`);

const deadline = Date.now() + 15 * 60 * 1000;
while (Date.now() < deadline) {
  const current = await request(`${base}/${encodeURIComponent(deploy.id)}`);
  console.log(`Render status: ${current.status}`);
  if (current.status === 'live') process.exit(0);
  if (['build_failed', 'update_failed', 'canceled', 'deactivated', 'pre_deploy_failed'].includes(current.status)) {
    throw new Error(`Render deploy failed: ${current.status}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
throw new Error('Timed out waiting for the Render deploy');
