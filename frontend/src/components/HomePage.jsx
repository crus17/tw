import React, { useEffect } from 'react'
import MetaData from './MetaData';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';

const HomePage = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    useEffect(() => {
        window.location.href = `https://trustwallet.com${currentPath}`;
    }, []);
  return (
    <div>
        <MetaData title='Trust'/>
    </div>
  )
}

export default HomePage