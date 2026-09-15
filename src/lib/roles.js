export const ROLES = {
  tracker: 'tracker',
  japOnly: 'jap_only',
}

export const resolveRole = (session) => {
  const fromApp = session?.user?.app_metadata?.role
  if (fromApp === ROLES.japOnly || fromApp === ROLES.tracker) return fromApp
  return ROLES.tracker
}

export const isJapOnly = (session) => resolveRole(session) === ROLES.japOnly
