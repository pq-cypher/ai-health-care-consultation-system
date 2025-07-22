import { StrictMode } from 'react'
import ReactDom from "react-dom/client";
import App from "./App";
import './styles/index.css';

let rootElement = document.getElementById("root");
const root = ReactDom.createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);