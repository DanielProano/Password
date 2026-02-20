import { useState, useEffect } from 'react';
import { use_auth } from '../context/AuthContext';
import { encrypt, decrypt } from '../context/Encrypt';
import './Vault.css';
import config from "../config.json";

function Vault() {	
	const { derived_key } = use_auth();
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
		if (!derived_key) {
			set_output("Unauthorized user");
			return;
		}

		const { key, token } = derived_key;

		try {
			const response = await fetch(`${config.backend}/vault/get`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
			});

			if (!response.ok) {
				set_output("Failed to get Passwords");
				return;
			}

			set_output('Access Granted');

			const data = await response.json();
			const decryptedEntries = [];

			for (const entry of data.vault) {
				const service_enc = JSON.parse(entry.service);
				const login_enc = JSON.parse(entry.login);
				const pass_enc = JSON.parse(entry.password);
				const notes_enc = JSON.parse(entry.notes || '{}');

				decryptedEntries.push({
					id: entry.id,
					service_decoded: await decrypt(key, service_enc.iv, service_enc.data),
					login_decoded: await decrypt(key, login_enc.iv, login_enc.data),
					pass_decoded: await decrypt(key, pass_enc.iv, pass_enc.data),
					notes_decoded: await decrypt(key, notes_enc.iv, notes_enc.data)
				});
			}

			setDisplay(decryptedEntries);
		} catch (error) {
			console.log('Error:', error);
			set_output("Internal Server Error");
		}
	}

	async function AddInfo() {
		if (!derived_key) return;
		if (!service || !login || !password) return;

		const { key, token } = derived_key;
		const serviceEnc = await encrypt(key, service);
		const loginEnc = await encrypt(key, login);
		const passEnc = await encrypt(key, password);
		const notesEnc = await encrypt(key, notes);

		const response = await fetch(`${config.backend}/vault/store`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
			body: JSON.stringify({
				service: serviceEnc,
				login: loginEnc,
				password: passEnc,
				notes: notesEnc
			}),
		});

		if (!response.ok) return;

		await GetInfo();
	}

	async function deleteInfo(id) {
		if (!derived_key) return;

		const { token } = derived_key;

		const response = await fetch(`${config.backend}/vault/delete/${id}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
		});

		if (!response.ok) return;

		await GetInfo();
	}

	useEffect(() => { GetInfo(); }, [derived_key]);

	return (
		<div className="vault-container">
			<h1 className="vault-title">Vault</h1>
			<p className="vault-output">{output}</p>

			<div className="vault-add-btn-container">
				<button className="vault-add-btn" onClick={() => setShowPopup(true)}>+</button>
			</div>

			{showPopup && (
				<div className="vault-popup-overlay">
					<div className="vault-popup">
						<div className="vault-popup-header">
							<h2>Add New Password</h2>
							<button onClick={() => setShowPopup(false)}>✕</button>
						</div>
						<div className="vault-popup-body">
							<label>Service</label>
							<input placeholder="Ex. Google" value={service} onChange={e => setService(e.target.value)} />

							<label>Login</label>
							<input placeholder="Ex. Email" value={login} onChange={e => setLogin(e.target.value)} />

							<label>Password</label>
							<input placeholder="Ex. 123" value={password} onChange={e => setPassword(e.target.value)} />

							<label>Notes</label>
							<textarea placeholder="Text" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />

							<button onClick={async () => { setShowPopup(false); await AddInfo(); }}>Done</button>
						</div>
					</div>
				</div>
			)}

			<div className="vault-list">
				{display.map(entry => (
					<div key={entry.id} className="vault-entry" onClick={() => { setCurrentEntry(entry); setShowDetailsPopup(true); }}>
						<div className="vault-entry-info">
							<div className="vault-entry-icon">{entry.service_decoded.charAt(0).toUpperCase()}</div>
							<p>{entry.service_decoded}</p>
						</div>
						<button className="vault-entry-delete" onClick={e => { e.stopPropagation(); deleteInfo(entry.id); }}>✕</button>
					</div>
				))}
			</div>

			{showDetailsPopup && currentEntry && (
				<div className="vault-popup-overlay">
					<div className="vault-popup">
						<div className="vault-popup-header">
							<h2>{currentEntry.service_decoded}</h2>
							<button onClick={() => setShowDetailsPopup(false)}>✕</button>
						</div>
						<div className="vault-popup-body">
							<div>
								<p>Login</p>
								<p>{currentEntry.login_decoded}</p>
							</div>
							<div>
								<p>Password</p>
								<p>{currentEntry.pass_decoded}</p>
							</div>
							{currentEntry.notes_decoded && (
								<div>
									<p>Notes</p>
									<p>{currentEntry.notes_decoded}</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Vault;

