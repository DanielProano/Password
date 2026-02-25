import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { use_auth } from "../context/AuthContext";
import { derive_key } from "../context/Encrypt";
import bcrypt from "bcryptjs";
import config from "../config.json";
import "./Login.css";

const isDev = import.meta.env.DEV;

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");

  const navigation = useNavigate();
  const { derived_key, set_derived_key } = use_auth();

  async function login() {
    try {
      console.log("Entered login");

      const salt_response = await fetch(
        `${config.backend}/salt?user=${encodeURIComponent(email)}`
      );

      const { master_salt } = await salt_response.json();
      const hash = await bcrypt.hashSync(password, master_salt);

      const response = await fetch(`${config.backend}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: email, hash: hash }),
      });
      console.log(response);

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        const { token, salt } = data;
        const key = await derive_key(password, salt);
        set_derived_key({ key: key, token: token });

        navigation("/vault");
      } else {
        setOutput(data.message || "Login failed, try again");
      }
    } catch (error) {
      console.error("Error:", error);
      setOutput("Login Error");
    }
  }

  return (
    <div className="login-page">
      <div className="header">
        <h1>A Password Manager</h1>
        <h2>Keeping your passwords secure</h2>
      </div>

      <div className="box">
       <div className="input">
         <input
           type="email"
           placeholder="Enter your email"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
         />
       </div>

       <div className="input">
         <input
           type="password"
           placeholder="Enter your password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
         />
       </div>

       <div className="output">{output}</div>

          <button className="login-button" onClick={login}>
            Login
          </button>
       </div>
      
      <div className="register-link">
        <p>
          {"Don't have an account? "} <Link to="/register">Register</Link>
        </p>
      </div>

      {isDev && (
        <button
          className="login-button"
          onClick={async () => {
            const fakeToken = "dev-token";
            const fakeKey = await derive_key("password123", "dev-salt");

            set_derived_key({ key: fakeKey, token: fakeToken });
            navigation("/vault");
          }}
        >
          Dev 
        </button>
      )}
    </div>
  );
}

export default LoginPage;

