import client from './client';
import { apiUserToUser, userToApiPayload } from './mappers';

// All functions here return data already mapped to our internal user shape
// (see mappers.js) so components never need to know about JSONPlaceholder's
// raw field names.

export async function fetchUsers() {
  const { data } = await client.get('/users');
  return data.map(apiUserToUser);
}

export async function createUser(user) {
  const payload = userToApiPayload(user);
  const { data } = await client.post('/users', payload);
  // JSONPlaceholder fakes a 201 with the payload echoed back, but never
  // assigns a real new id (it usually just returns id: 11). We generate a
  // locally-unique id that's clearly "new" (sorts after the real 1-10 ids
  // and is visually short) instead of using a raw timestamp.
  const fakeId = data?.id && data.id !== 11 ? data.id : generateLocalId();
  return apiUserToUser({ ...payload, id: fakeId });
}

let localIdCounter = 1000;
function generateLocalId() {
  localIdCounter += 1;
  return localIdCounter;
}

export async function updateUser(id, user) {
  const payload = userToApiPayload(user);
  const { data } = await client.put(`/users/${id}`, payload);
  // JSONPlaceholder echoes the payload back without the id sometimes, so we
  // force the id to stay the one we intended to update.
  return apiUserToUser({ ...payload, ...data, id });
}

export async function deleteUser(id) {
  await client.delete(`/users/${id}`);
  return id;
}
