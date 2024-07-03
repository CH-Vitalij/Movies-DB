import { createRoot } from 'react-dom/client';
import './style.css';

import App from './components/App';

const root = createRoot(document.querySelector('.moviesapp'));
root.render(<App />);
