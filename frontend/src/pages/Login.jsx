import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { use_auth } from '../context/AuthContext';
import { derive_key } from '../context/Encrypt';
import bcrypt from 'bcryptjs';
import config from "../config.json";

function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [output, setOutput] = useState('');

	const navigation = useNavigate();
	const { derived_key, set_derived_key } = use_auth();

	async function login() {
		try {
         console.log("Entered login")
			const salt_response = await fetch(`${config.backend}/api/salt?user=${encodeURIComponent(email)}`);

         console.log(salt_response);

			const { master_salt } = await salt_response.json();

			const hash = await bcrypt.hashSync(password, master_salt);

			const response = await fetch(`${config.backend}/api/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user: email, hash: hash })
			});

         console.log(response);

			const data = await response.json();

         console.log(data);

			if (response.ok) {
				const { token, salt } = data;

				const key = await derive_key(password, salt);

				set_derived_key({ key: key, token: token });
	
				navigation('/pass/vault');
			} else {
				setOutput(data.message || 'Login failed, try again');
			}
		} catch (error) {
			console.error('Error:', error);
			setOutput('Login Error');
		}
	}

	return (
      <div class="app">
         <div className="flex flex-col justify-center items-center mt-30 text-2xl">
            <h1>A Password Manager</h1>
            <div className="mt-5 h-20 text-3xl">
               <h2>Keeping your passwords secure</h2>
            </div>
         </div>

         <div className="flex justify-center items-center">
            <div className="border-2 border-[#3a4e7e] bg-[#202733] p-11 rounded-[24px]">
               <div className="border-2 border-[#87a6ed] bg-[#202733] px-4 py-2 rounded-full mb-5 flex items-center">
                  <input
                     type='email'
                     placeholder='Enter your email'
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                  /><br /><br />
               </div>

               <div className="border-2 border-[#87a6ed] bg-[#202733] px-4 py-2 rounded-full mb-5 flex items-center">
                  <input
                     type='password'
                     placeholder='Enter your password'
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                  /><br /><br />
               </div>
               <div className="flex justify-center mt-[20px]"><p>{output}</p></div>
               <div className="flex justify-center mt-[10px]">
                  <button onClick={login} className="rounded-[24px] border-2 border-[#87a6ed] px-5 py-2.5 text-base font-thin text-[#87a6ed] cursor-pointer transition-colors duration-100 hover:bg-[#394b74]">Login</button>
               </div>
            </div>
         </div>

         <div className="flex justify-center items-center mt-[20px]">
            <p>{"Don't have an account?"} <Link to="/register">Register</Link></p>
         </div>
      </div>
      );
}

export default LoginPage;
