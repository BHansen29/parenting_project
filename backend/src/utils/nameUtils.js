function getFirstName(user) {
  if (user?.name) return user.name;
  if (user?.email) return user.email.split('@')[0];
  return 'Co-parent';
}

module.exports = { getFirstName };
