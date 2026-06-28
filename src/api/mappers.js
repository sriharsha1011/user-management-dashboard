// JSONPlaceholder's /users objects look like:
// { id, name, username, email, address: {...}, phone, website, company: { name, catchPhrase, bs } }
//
// This dashboard's spec asks for First Name / Last Name / Department, none of
// which exist natively on JSONPlaceholder. Documented assumptions (see README):
//   - "name" is split on the first space into firstName / lastName.
//     Single-word names are kept entirely as firstName with an empty lastName.
//   - "company.name" is used to stand in for Department.
// All mapping is centralized here so the rest of the app only ever deals with
// our own { id, firstName, lastName, email, department, raw } shape.

export function apiUserToUser(apiUser) {
  const fullName = apiUser.name || '';
  const firstSpace = fullName.indexOf(' ');
  const firstName = firstSpace === -1 ? fullName : fullName.slice(0, firstSpace);
  const lastName = firstSpace === -1 ? '' : fullName.slice(firstSpace + 1);

  return {
    id: apiUser.id,
    firstName,
    lastName,
    email: apiUser.email || '',
    department: apiUser.company?.name || '',
    username: apiUser.username || '',
    phone: apiUser.phone || '',
    website: apiUser.website || '',
    raw: apiUser,
  };
}

export function userToApiPayload(user) {
  return {
    name: [user.firstName, user.lastName].filter(Boolean).join(' '),
    email: user.email,
    username: user.username || (user.firstName || '').toLowerCase().replace(/\s+/g, ''),
    company: { name: user.department },
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.website ? { website: user.website } : {}),
  };
}
