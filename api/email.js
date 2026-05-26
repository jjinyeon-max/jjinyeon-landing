export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email, created_at: new Date().toISOString() })
    });

    if (response.ok || response.status === 201) {
      return res.status(200).json({ success: true });
    }
    const err = await response.json();
    if (err.code === '23505') {
      return res.status(200).json({ success: true, message: '이미 등록된 이메일입니다' });
    }
    return res.status(500).json({ error: '저장 실패' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
