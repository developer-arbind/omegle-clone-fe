import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Text from './pages/Text.jsx'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";

import { Provider } from 'react-redux'
import store
 from './redux/store.js'

const router = createBrowserRouter([
  {
    path :'/',
    element: <App />
  }, {
    path: "/room",
    element: <Text />
  },
  {
    path: '/video',
    element: ""
  }
])
ReactDOM.createRoot(document.getElementById('root')).render(
   
  <Provider store={store}><RouterProvider router={router} /></Provider>
  
)
