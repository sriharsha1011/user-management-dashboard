const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUserForm(values) {
  const errors = {};

  if (!values.firstName || !values.firstName.trim()) {
    errors.firstName = 'First name is required.';
  } else if (values.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  }

  if (!values.lastName || !values.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  }

  if (!values.email || !values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.department || !values.department.trim()) {
    errors.department = 'Department is required.';
  }

  return errors;
}

export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}
