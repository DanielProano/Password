import { Routes, Route } from 'react-router-dom';
import { TopBar } from '@dproano_npm/website-topbar';

import { PassLogin, PassRegister, PassRegisterSuccess, PassVault, NotFound } from './pages/index';

function App() {
	return (
		<div className="layout">
			<TopBar />
			<div className="content">
				<Routes>
					<Route path="/" element={<PassLogin />} />
					<Route path="/register" element={<PassRegister />} />
					<Route path="/vault" element={<PassVault />} />
					<Route path="/registerSuccess" element={<PassRegisterSuccess />} />
					<Route path="/*" element={<NotFound />} />
				</Routes>
			</div>
		</div>
	);
}

export default App;
