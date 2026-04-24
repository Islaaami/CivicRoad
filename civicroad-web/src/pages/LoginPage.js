import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../store/AuthContext";

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate replace to="/" />;
  }

  const redirectPath = location.state?.from?.pathname || "/";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userData = await loginUser(formValues);
      login(userData);
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to sign in right now."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  return (
    <div className="login-page">

      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__header">
            <p className="login-form__eyebrow">CivicRoad</p>
            <h2 className="login-form__title">Please Login to Admin Dashboard.</h2>
            <p className="login-form__text">
              Municipality Staff sign in.
            </p>
          </div>

          <div className="field-grid">
            <label className="field-label">
              <span>Email</span>
              <input
                className="field-input"
                name="email"
                onChange={handleChange}
                placeholder="staff@city.local"
                required
                type="email"
                value={formValues.email}
              />
            </label>

            <label className="field-label">
              <span>Password</span>
              <input
                className="field-input"
                name="password"
                onChange={handleChange}
                placeholder="Enter any password"
                required
                type="password"
                value={formValues.password}
              />
            </label>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          <button className="button" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Open Dashboard"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
