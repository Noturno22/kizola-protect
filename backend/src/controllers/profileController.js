const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const createProfile = async (req, res, next) => {
  try {
    const { userId, email, fullName } = req.body;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token is required.' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required.' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }

    if (user.id !== userId) {
      return res.status(403).json({ success: false, error: 'Token does not match userId.' });
    }

    const policyNumber = `KP-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: userId,
      email: email || user.email || '',
      full_name: fullName || email?.split('@')[0] || 'Utilizador',
      role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : 'user',
      policy_number: policyNumber,
    }, { onConflict: 'id', ignoreDuplicates: false });

    if (upsertError) {
      logger.error('Failed to create profile', { userId, error: upsertError.message });
      return res.status(500).json({ success: false, error: 'Failed to create profile.' });
    }

    logger.info('Profile created/updated via backend', { userId });
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProfile };
