import { useEffect, useState } from 'react';
import { validateUserForm, isFormValid } from '../utils/validation';
import { IconX } from './Icons';

const EMPTY_VALUES = { firstName: '', lastName: '', email: '', department: '' };

export default function UserForm({ user, onSave, onClose, saving }) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (user) {
      setValues({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
      });
    } else {
      setValues(EMPTY_VALUES);
    }
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [user]);

  function handleChange(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validateUserForm(values));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateUserForm(values);
    setErrors(nextErrors);
    setTouched({ firstName: true, lastName: true, email: true, department: true });
    setSubmitError(null);

    if (!isFormValid(nextErrors)) return;

    const result = await onSave(values);
    if (!result.ok) {
      setSubmitError(result.message);
    }
  }

  function fieldProps(name, type = 'text') {
    return {
      id: name,
      type,
      value: values[name],
      onChange: (e) => handleChange(name, e.target.value),
      onBlur: () => handleBlur(name),
      className: touched[name] && errors[name] ? 'has-error' : '',
      'aria-invalid': touched[name] && Boolean(errors[name]),
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    };
  }

  return (
    <div
      className="overlay modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <form onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2 id="form-title">{isEdit ? 'Edit user' : 'Add user'}</h2>
            <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
              <IconX width={18} height={18} />
            </button>
          </div>

          <div className="panel-body">
            {submitError && (
              <div className="banner banner-error" role="alert">
                {submitError}
              </div>
            )}

            <div className="form-grid">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input {...fieldProps('firstName')} placeholder="Ada" autoFocus />
                {touched.firstName && errors.firstName && (
                  <span className="field-error" id="firstName-error">{errors.firstName}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input {...fieldProps('lastName')} placeholder="Lovelace" />
                {touched.lastName && errors.lastName && (
                  <span className="field-error" id="lastName-error">{errors.lastName}</span>
                )}
              </div>

              <div className="field full">
                <label htmlFor="email">Email</label>
                <input {...fieldProps('email', 'email')} placeholder="ada@example.com" />
                {touched.email && errors.email && (
                  <span className="field-error" id="email-error">{errors.email}</span>
                )}
              </div>

              <div className="field full">
                <label htmlFor="department">Department</label>
                <input {...fieldProps('department')} placeholder="Engineering" />
                {touched.department && errors.department && (
                  <span className="field-error" id="department-error">{errors.department}</span>
                )}
              </div>
            </div>
          </div>

          <div className="panel-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
