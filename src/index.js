import { createRoot } from 'react-dom/client';

import App from './components/App';
// import 'antd/dist/antd.css'

const root = createRoot(document.querySelector('.moviesapp'));
root.render(<App />);
