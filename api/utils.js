// Checking for req.user being set
function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: 'MissingUserError',
      message: 'You must be logged in to perform this action',
    });
  }

  next();
}

//check if user is active
function requireActiveUser(req, res, next) {
  if (!req.user.active) {
    next({
      name: 'UserNotActiveError',
      message: 'Current user is not active',
    });
  }
  next();
}

module.exports = {
  requireUser,
  requireActiveUser,
};
