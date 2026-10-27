import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import {
  useLocation
} from 'react-router-dom';
import Base from '../api/Base';
const SiteContentContext = createContext([]);
export const useSiteContent = () => useContext(SiteContentContext);
export function SiteContentProvider({
  children
}) {
  const [rows, setRows] = useState([]);
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!localStorage.getItem('token')) {
        setRows([]);
        return;
      }
      const result = await new Base().sendRequest({
        path: '/api/v1/site-content'
      });
      if (active && result.ok) setRows(result.data.rows || []);
    };
    refresh();
    window.addEventListener('site-content:refresh', refresh);
    return () => {
      active = false;
      window.removeEventListener('site-content:refresh', refresh);
    };
  }, [pathname]);
  return <SiteContentContext.Provider value={rows}>{children}</SiteContentContext.Provider>;
}
