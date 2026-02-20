import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import config from "../config.json";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const [passWarn, setPassWarn] = useState("");

  const navigate = useNavigate();

  function validatePassword(pass) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
    return regex.test(pass);
  }

  function handlePassChange(e) {
    const value = e.target.value;
    setPassword(value);

    if (!validatePassword(value)) {
      setPassWarn(
        "Password requires 12 characters with a special, capital, lowercase, and number"
      );
    } else {
      setPassWarn("");
    }
  }

  async function register_login() {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newLogin = {
      user: email,
      hash: hash,
      master_salt: salt,
    };

    try {
      const response = await fetch(`${config.backend}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLogin),
      });

      if (response.ok) {
        navigate("/RegisterSuccess");
      } else {
        setOutput("Couldnt Register");
      }
    } catch (error) {
      console.error("Error:", error);
      setOutput("Login Error");
    }
  }

  return (
      <div className="register-page">
        <h1>Register for Password Manager</h1>

        <div className="box">
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="Register a New User"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <input
              type="password"
              placeholder="Register a New Password"
              value={password}
              onChange={handlePassChange}
            />
          </div>

          <button
            onClick={register_login}
            disabled={!email || !password}
          >
            Register
          </button>
        </div>

        {passWarn && <div className="error">{passWarn}</div>}
        {output && <p className="output">{output}</p>}
      </div>
  );
}

export default Register;

