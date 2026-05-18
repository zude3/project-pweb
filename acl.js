/**
 * Cek apakah user memiliki role tertentu
 * @param {Object} session - req.session
 * @param {string|string[]} roles - satu role atau array role
 * @returns {boolean}
 */
function hasRole(session, roles) {
    if (!session || !session.userRole) return false;
    if (Array.isArray(roles)) {
        return roles.includes(session.userRole);
    }
    return session.userRole === roles;
}

/**
 * Cek apakah user memiliki permission tertentu
 * @param {Object} session - req.session
 * @param {string} permission - nama permission (contoh: 'tambah-alat')
 * @returns {boolean}
 */
function hasPermission(session, permission) {
    if (!session || !session.permissions) return false;
    return session.permissions.includes(permission);
}

/**
 * Cek apakah user sudah login
 * @param {Object} session - req.session
 * @returns {boolean}
 */
function isLoggedIn(session) {
    return !!(session && session.userId);
}

/**
 * Middleware: inject helper ACL ke res.locals
 * Sehingga bisa dipakai langsung di semua file EJS:
 *   hasRole, hasPermission, isLoggedIn, currentUser
 *
 * Pasang di app.js SEBELUM route:
 *   app.use(aclLocals);
 */
function aclLocals(req, res, next) {
    res.locals.hasRole = (roles) => hasRole(req.session, roles);
    res.locals.hasPermission = (permission) => hasPermission(req.session, permission);
    res.locals.isLoggedIn = () => isLoggedIn(req.session);
    res.locals.currentUser = req.session
        ? {
            id: req.session.userId || null,
            name: req.session.userName || null,
            role: req.session.userRole || null,
            permissions: req.session.permissions || [],
          }
        : null;
    next();
}

module.exports = { hasRole, hasPermission, isLoggedIn, aclLocals };
``