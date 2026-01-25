import { createContext, useState, useContext } from 'react';

const auth_context = createContext(null);

export function AuthProvider({ children }) {
	const [derived_key, set_derived_key] = useState(null);

	return (
		<auth_context.Provider value= {{ derived_key, set_derived_key }}>
			{children}
		</auth_context.Provider>
	);
}

export function use_auth() {
	return useContext(auth_context);
}
