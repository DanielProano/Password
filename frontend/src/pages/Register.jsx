import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import config from "../config.json";


function Register() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [output, setOutput] = useState('');
	const [passWarn, setPassWarn] = useState('');

	const navigate = useNavigate();

	function validatePassword(pass) {
		const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/
		return regex.test(pass);
	}

	function handlePassChange(e) {
		const value = e.target.value;
		setPassword(value);

		if (!validatePassword(value)) {
			setPassWarn('Password requires 12 characters with a special, capital, lowercase, and number');
		} else {
			setPassWarn('');
		}
	}

	async function register_login() {
		const salt = bcrypt.genSaltSync(10);

		const hash = bcrypt.hashSync(password, salt);

		const newLogin = {
			user: email,
			hash: hash,
			master_salt: salt
		};

		try {
         const response = await fetch(`${config.backend}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLogin)
         });

         if (response.ok) {
            navigate('/pass/RegisterSuccess');
         } else {
            setOutput('Couldnt Register');
         }
      } catch (error) {
            console.error('Error:', error);
            setOutput('Login Error');
      }
	}	


	const html = (
      <div class="app">
         <div className="flex flex-col justify-center items-center">
            <div className="mt-30 text-2xl pl-20">
               <h1>Register for Password Manager</h1>
            </div>   

            <div className="border-2 border-[#3a4e7e] bg-[#202733] p-11 rounded-[24px] mt-[80px]">  
               <div className="border-2 border-[#87a6ed] bg-[#202733] px-4 py-2 rounded-full mb-5 flex items-center justify-center">
                  <input
                     type='email'
                     placeholder='Register a New User'
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     /><br /><br />
               </div>
               
               <div className="border-2 border-[#87a6ed] bg-[#202733] px-4 py-2 rounded-full mb-5 flex items-center justify-center">
                  <input
                     type='password'
                     placeholder='Register a New Password'
                     value={password}
                     onChange={handlePassChange}
                  /><br /><br />
               </div>
            
               <div className="flex justify-center items-center">
                  <button onClick={register_login} disabled={!email || !password}>Register</button>
               </div>
            </div>

            <div className="flex justify-center items-center">
              {passWarn && <div className="error">{passWarn}</div>}
            </div>
            
            <p>{output}</p>	
         </div>
      </div>
	);

	return html;
};

export default Register;
