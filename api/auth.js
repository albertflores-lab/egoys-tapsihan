const { signToken, setCors } = require('./_auth');

const ACCOUNTS = {
  "admin@egoys.com": { pass: "admin123", name: "Egoy Admin", role: "admin", av: "EA" },
  "guest@egoys.com": { pass: "guest123", name: "Guest User", role: "guest", av: "GU" },
};

module.exports = function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, email, password, name } = req.body || {};

  if (action === "login") {
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const account = ACCOUNTS[email.toLowerCase().trim()];
    if (!account || account.pass !== password) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken({ email: email.toLowerCase().trim(), name: account.name, role: account.role });

    return res.status(200).json({
      success: true,
      token,
      user: { email: email.toLowerCase().trim(), name: account.name, role: account.role, av: account.av },
    });
  }

  if (action === "register") {
    if (!email || !password || !name) return res.status(400).json({ error: "Name, email, and password are required" });
    const initials = name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    return res.status(200).json({
      success: true,
      user: { email: email.toLowerCase().trim(), name: name.trim(), role: "guest", av: initials || "GU" },
    });
  }

  if (action === "social") {
    const { provider, providerName } = req.body;
    const displayName = providerName || `${provider} User`;
    const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    return res.status(200).json({
      success: true,
      user: { email: `${provider}_${Date.now()}@social.egoys.com`, name: displayName, role: "guest", av: initials, provider },
    });
  }

  return res.status(400).json({ error: "Invalid action. Use: login, register, or social" });
};
