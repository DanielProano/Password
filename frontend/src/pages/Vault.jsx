import { useState, useEffect } from 'react';
import { use_auth } from '../context/AuthContext';
import { encrypt, decrypt } from '../context/Encrypt';
import './Vault.css';
import config from "../config.json";

function Vault() {	
	const { derived_key, set_derived_key } = use_auth();
	const [output, set_output] = useState('');
	const [showPopup, setShowPopup] = useState(false);
	const [showDetailsPopup, setShowDetailsPopup] = useState(false);
	const [display, setDisplay] = useState([]);
	const [currentEntry, setCurrentEntry] = useState(null);

	const [service, setService] = useState('');
	const [login, setLogin] = useState('');
	const [password, setPassword] = useState('');
	const [notes, setNotes] = useState('');

	async function GetInfo() {
		try {
         if (!derived_key) {
            set_output("Unauthorized user")
            return
         }
         const { key, token } = derived_key;

         const response = await fetch(`${config.backend}/api/vault/get`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`},
         });

         if (!response.ok) {
            set_output("Failed to get Passwords")
            console.log("Failed to get Passwords")
            return
         }
         
         set_output('Access Granted');

         const data = await response.json();
         const decryptedEntries = [];

         for (const entry of data.vault) {
            const service_enc = JSON.parse(entry.service);
            const login_enc = JSON.parse(entry.login);
            const pass_enc = JSON.parse(entry.password);
            const notes_enc = JSON.parse(entry.notes || '{}');

            const service_decoded = await decrypt(key, service_enc.iv, service_enc.data);	
            const login_decoded = await decrypt(key, login_enc.iv, login_enc.data);
            const pass_decoded = await decrypt(key, pass_enc.iv, pass_enc.data);
            const notes_decoded = await decrypt(key, notes_enc.iv, notes_enc.data);
            decryptedEntries.push({id: entry.id, service_decoded, login_decoded, pass_decoded, notes_decoded});
         }
         setDisplay(decryptedEntries);
		} catch (error) {
			console.log('Error:', error);
         set_output("Internal Server Error")
		}
	}

	async function AddInfo() {
		try {
         if (!derived_key) {
            console.log("Unauthorized User")
            return
         }

         if (!service || !login || !password) {
            console.log("Not enough info");
            return;
         }

         const { key, token } = derived_key;
         const { iv: service_iv, data: service_data } = await encrypt(key, service);
         const { iv: login_iv, data: login_data } = await encrypt(key, login);
         const {iv: pass_iv, data: pass_data } = await encrypt(key, password);
         const {iv: notes_iv, data: notes_data } = await encrypt(key, notes);

         const response = await fetch(`${config.backend}/api/vault/store`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`},
            body: JSON.stringify({
               service: { iv: service_iv, data: service_data },
               login: { iv: login_iv, data: login_data },
               password: { iv: pass_iv, data: pass_data },
               notes: { iv: notes_iv, data: notes_data }
            })
         });

         if (!response.ok) {
            console.log("Error storing data")
            return
         }

         const data = await response.json();
         console.log('Added info');
         GetInfo();
		} catch (error) {
			console.log("Error", error);
		}
	} 

	async function deleteInfo(id) {
		try {
         if (!derived_key) {
            console.log("Unauthorized user")
            return
         }
         
         const { key, token } = derived_key;
         const response = await fetch(`${config.backend}/api/vault/delete/${id}`, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            console.log("Error deleting info")
            return
         }
         
         console.log('Deleted a entry successfully');
         GetInfo();
		} catch (error) {
			console.log("Error:", error);
		}
	}

	useEffect(() => {
		GetInfo();
	}, [derived_key]);

   return (
      <div>
         <h1 className="fixed top-20 left-2">Vault</h1>
         <p className="fixed top-35 left-4">{output}</p>

         <div className="fixed bottom-10 right-10">
            <button className="rounded-[24px] border-2 border-[#87a6ed] px-5 py-2.5 text-base font-thin text-[#87a6ed] cursor-pointer transition-colors duration-100 hover:bg-[#394b74]" onClick={(e) => setShowPopup(true)}>+</button>
         </div>

         {showPopup && (
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
               <div className="bg-[#3a59a1]/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-96">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-white/90 text-xl font-semibold">Add New Password</h2>
                     <button 
                         onClick={() => setShowPopup(false)}
                         className="rounded-[24px] border-2 border-[#87a6ed] px-5 py-2.5 text-base font-thin text-[#87a6ed] cursor-pointer transition-colors duration-100 hover:bg-[#394b74]"
                     >
                        ✕
                     </button>
                  </div>
               
               <div className="space-y-4">
                  <div>
                     <label className="text-white/90 text-sm font-medium mb-2 block">Service</label>
                     <input 
                        placeholder="Ex. Google" 
                        value={service} 
                        onChange={(e) => setService(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/30 transition-all"
                     />
                  </div>
                 
                  <div>
                     <label className="text-white/90 text-sm font-medium mb-2 block">Login</label>
                     <input 
                        placeholder="Ex. Email" 
                        value={login} 
                        onChange={(e) => setLogin(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/30 transition-all"
                     />
                  </div>
                 
                  <div>
                     <label className="text-white/90 text-sm font-medium mb-2 block">Password</label>
                     <input 
                        placeholder="Ex. 123" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/30 transition-all"
                      />
                  </div>
                 
                  <div>
                     <label className="text-white/90 text-sm font-medium mb-2 block">Notes</label>
                     <textarea 
                        placeholder="Text" 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/30 transition-all resize-none"
                      />
                  </div>
                
                  <div className="flex justify-center">
                     <button 
                        onClick={async () => { setShowPopup(false); await AddInfo(); }}
                         className="rounded-[24px] border-2 border-[#87a6ed] px-5 py-2.5 text-base font-thin text-[#87a6ed] cursor-pointer transition-colors duration-100 hover:bg-[#394b74]"
                        >
                        Done
                     </button>
                  </div>  
               </div>
             </div>
           </div>
         )}
         
         <div className="space-y-5 pt-30 pl-10 max-w-4xl">
            {display.map((entry, index) => (
               <div 
                  key={entry.id}
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/15 hover:border-[#00D9FF]/50 transition-all cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    setCurrentEntry(entry);
                    setShowDetailsPopup(true);
                  }}
               >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#00D9FF]/20 rounded-lg flex items-center justify-center text-[#00D9FF] font-semibold text-lg">
                     {entry.service_decoded.charAt(0).toUpperCase()}
                     </div>
                     <p className="text-white font-medium">{entry.service_decoded}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      deleteInfo(entry.id); 
                    }}
                    className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-red-400 hover:bg-red-400/10 w-8 h-8 rounded-lg transition-all flex items-center justify-center"
                  >
                    ✕
                  </button>
               </div>
            ))}          
         </div>

         {showDetailsPopup && currentEntry && (
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
               <div className="bg-[#3a59a1]/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-96">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-white text-xl font-semibold">{currentEntry.service_decoded}</h2>
                     <button 
                        onClick={() => setShowDetailsPopup(false)}
                        className="text-white/80 hover:text-white hover:bg-white/10 w-8 h-8 rounded-lg transition-all"
                     >
                        ✕
                     </button>
                  </div>
                  <div className="space-y-4">
                     <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm mb-1">Login</p>
                        <p className="text-white font-medium">{currentEntry.login_decoded}</p>
                     </div>
        
                     <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <p className="text-white/70 text-sm mb-1">Password</p>
                        <p className="text-white font-medium font-mono">{currentEntry.pass_decoded}</p>
                     </div>
        
                     {currentEntry.notes_decoded && (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                           <p className="text-white/70 text-sm mb-1">Notes</p>
                           <p className="text-white">{currentEntry.notes_decoded}</p>
                        </div>
                     )}
                  </div>
               </div> 
            </div>
         )}
      </div>  
	);
};

export default Vault;
