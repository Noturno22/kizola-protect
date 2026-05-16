/**
 * Supabase Admin service (server-side only).
 * Uses the SERVICE_ROLE_KEY — never exposed to the frontend.
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Gets or creates a Supabase user by phone number.
 * Returns access_token and refresh_token for the frontend.
 *
 * @param {string} phone - Verified E.164 phone number
 * @returns {Promise<{ userId: string; accessToken: string; refreshToken: string; isNew: boolean }>}
 */
const getOrCreateUserByPhone = async (phone) => {
  const digitsOnly = phone.replace(/\W/g, '');
  const placeholderEmail = `${digitsOnly}@phone.kizola.app`;
  // Deterministic password based on phone (only used internally, never exposed)
  const userPassword = `kp_${digitsOnly}_${process.env.SUPABASE_URL?.slice(8, 16) || 'default'}`;

  // 1. Try to find existing user by email (faster than listUsers)
  let user = null;
  let isNew = false;

  try {
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserByEmail(placeholderEmail);
    if (!getUserError && userData?.user) {
      user = userData.user;
    }
  } catch {
    // getUserByEmail may not be available, fallback to listUsers
    const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 100 });
    user = existingUsers?.users?.find((u) => u.email === placeholderEmail || u.phone === phone);
  }

  // 2. Create user if not found
  if (!user) {
    const policyNumber = `KP-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      phone,
      email: placeholderEmail,
      password: userPassword,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { phone, policy_number: policyNumber, role: 'user', full_name: 'Phone User' },
    });

    if (createError) {
      // If user already exists (race condition), try to fetch again
      if (createError.status === 422 || createError.message?.includes('already')) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 100 });
        user = existingUsers?.users?.find((u) => u.email === placeholderEmail);
        if (!user) throw createError;
      } else {
        logger.error('Failed to create user', { error: createError.message });
        throw createError;
      }
    } else {
      user = created.user;
      isNew = true;

      // Create profile row (ignore duplicates)
      await supabase.from('profiles').insert({
        id: user.id,
        email: placeholderEmail,
        full_name: 'Phone User',
        phone,
        role: 'user',
        policy_number: policyNumber,
      }).catch((e) => {
        if (e.code !== '23505') logger.warn('Profile insert warning', { code: e.code, msg: e.message });
      });

      // Welcome notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Bem-vindo à Kizola Protect!',
        message: 'Sua conta foi criada com sucesso. Explore nossos benefícios.',
        type: 'success',
        read: false,
      }).catch(() => {});

      logger.info('New user created via phone', { userId: user.id });
    }
  }

  // 3. Sign in with email/password to get session tokens
  const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
    email: placeholderEmail,
    password: userPassword,
  });

  if (signInError || !sessionData?.session) {
    logger.error('Failed to sign in after phone verification', { error: signInError?.message });
    throw signInError || new Error('Failed to create session');
  }

  return {
    userId: user.id,
    accessToken: sessionData.session.access_token,
    refreshToken: sessionData.session.refresh_token,
    isNew,
  };
};

module.exports = { getOrCreateUserByPhone, supabase };
