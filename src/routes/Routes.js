import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
import Home from '../views//Home'
export default function Routing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = window.localStorage.getItem("token")
    console.log({token})
    if(token != null){
      setIsLoggedIn(true)
      setLoading(false)
    }
  }, [])

  return (
    <div className="content">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>

          {/* {
            !loading && isLoggedIn ? (
              <>
                <Route path='/home' element={<Home/>}/>
              </>
            ) : (
              <>
                <Route path='/home' element={<Home/>}/>
              </>
            )
          } */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}