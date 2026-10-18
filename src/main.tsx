import React from "react";
import {createRoot} from "react-dom/client";
import Book from "./Book";
import "./style.css";
import {initializeLanguage} from './i18n.ts';
initializeLanguage();
createRoot(document.getElementById("root")!).render(<Book/>);
