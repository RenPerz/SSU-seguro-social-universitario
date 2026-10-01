import { useState } from 'react';
import { api } from '../services/api';

const initialForm = {
  nombres: '',
  apellidos: '',
  carnet: '',
  email: '',
  telefono: '',
  password: '',
};

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = mode === 'login'
        ? await api.login({ identifier, password })
        : await api.register({ ...form, password });
      onAuthenticated(response);
    } catch (requestError) {
      setError(requestError.message || 'No pudimos completar la operación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__mark">SSU</span>
          <div>
            <p className="eyebrow">Seguro Social Universitario</p>
            <h1>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
          </div>
        </div>
        <p className="auth-card__intro">
          Accede a tus citas, recordatorios y servicios de atención universitaria.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="nombres">Nombres</label>
                  <input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label htmlFor="apellidos">Apellidos</label>
                  <input id="apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} required />
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="carnet">Carnet</label>
                  <input id="carnet" name="carnet" value={form.carnet} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} />
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="field-group">
              <label htmlFor="identifier">Email o carnet</label>
              <input id="identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
            </div>
          )}

          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-field">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={mode === 'login' ? password : form.password} onChange={(event) => mode === 'login' ? setPassword(event.target.value) : handleChange(event)} required minLength="8" />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {error && <div className="feedback feedback--error">{error}</div>}
          <button type="submit" className="primary-button primary-button--full" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarme'}
          </button>
        </form>

        <button type="button" className="auth-switch" onClick={() => { setMode((current) => current === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </section>
    </main>
  );
}
