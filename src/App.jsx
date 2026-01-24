import { Routes, Route } from 'react-router-dom';

import { Home } from './pages/index';

function App() {
	return (
		<div className="layout">
			<div className="content">
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</div>
		</div>
	);
}

export default App;
