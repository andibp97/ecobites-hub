import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-GPXYLTYRVP"; // înlocuiește cu ID-ul tău real
ReactGA.initialize(GA_MEASUREMENT_ID);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
