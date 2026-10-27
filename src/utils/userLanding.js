export const isAdministrator = role => String(role || '').trim().toLowerCase() === 'administrator';
export const getLandingPath = role => isAdministrator(role) ? '/admin' : '/dashboard';
