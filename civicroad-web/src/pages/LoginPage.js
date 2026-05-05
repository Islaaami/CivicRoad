import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
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
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />

      <div className={styles.layout}>
        <Card className={styles.hero} tone="soft">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>CivicRoad</span>
            <h1 className={styles.heroTitle}>Municipal operations console</h1>
            <p className={styles.heroText}>
              A cleaner workflow for monitoring urban issues, dispatching
              action faster, and keeping the service queue under control.
            </p>
          </div>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <strong>Live report triage</strong>
              <span>
                Review status, priority, and supporting evidence from one workspace.
              </span>
            </div>
            <div className={styles.featureItem}>
              <strong>Spatial coordination</strong>
              <span>
                Open the city map to validate coordinates and identify clusters quickly.
              </span>
            </div>
            <div className={styles.featureItem}>
              <strong>Moderation records</strong>
              <span>
                Keep false submissions archived without losing accountability.
              </span>
            </div>
          </div>
        </Card>

        <Card className={styles.panel}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <span className={styles.eyebrow}>Staff Sign In</span>
              <h2 className={styles.formTitle}>Access your dashboard</h2>
              <p className={styles.formText}>
                Sign in with your municipality account to continue to the operations board.
              </p>
            </div>

            <div className={styles.fields}>
              <Field htmlFor="email" label="Email">
                <Input
                  id="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="staff@municipality.ma"
                  required
                  type="email"
                  value={formValues.email}
                />
              </Field>

              <Field htmlFor="password" label="Password">
                <Input
                  id="password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={formValues.password}
                />
              </Field>
            </div>

            {error ? <Notice>{error}</Notice> : null}

            <Button fullWidth loading={loading} size="lg" type="submit">
              {loading ? "Signing in..." : "Open dashboard"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
