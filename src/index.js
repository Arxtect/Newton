import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Styles and components
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Header } from './features/header/Header';
import { Footer } from './features/footer/Footer';
// Redux
import { Provider } from "react-redux";
import store from "./store";
import { lazy, Suspense } from 'react';

const App = lazy(() => import('./App'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <BrowserRouter>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route active path="/" element={<App />}></Route>
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  </Provider>
  // </React.StrictMode>
);

reportWebVitals();