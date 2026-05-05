import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import Icon from "../components/Icon";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Field, Input } from "../components/ui/Field";
import Notice from "../components/ui/Notice";
import { useAuth } from "../store/AuthContext";
import styles from "./LoginPage.module.css";

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
        requestError.response?.data?.message ||
          "Connexion impossible pour le moment."
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
    <div className={styles.page}>
      <Card className={styles.panel} padding="lg">
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>
              <Icon name="road" size={18} />
            </span>
            <h1 className={styles.brandName}>CivicRoad</h1>
          </div>

          <div className={styles.fields}>
            <Field htmlFor="email" label="Email">
              <Input
                autoComplete="email"
                autoFocus
                id="email"
                name="email"
                onChange={handleChange}
                placeholder="agent@commune.ma"
                required
                type="email"
                value={formValues.email}
              />
            </Field>

            <Field htmlFor="password" label="Mot de passe">
              <Input
                autoComplete="current-password"
                id="password"
                name="password"
                onChange={handleChange}
                placeholder="Entrez votre mot de passe"
                required
                type="password"
                value={formValues.password}
              />
            </Field>
          </div>

          {error ? <Notice>{error}</Notice> : null}

          <Button fullWidth loading={loading} size="lg" type="submit">
            {loading ? "Connexion..." : "Connexion"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
