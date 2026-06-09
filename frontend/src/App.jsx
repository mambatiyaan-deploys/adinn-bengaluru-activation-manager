import React, { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Locations from './pages/Locations.jsx';
import ProposalBuilder from './pages/ProposalBuilder.jsx';
import ImportData from './pages/ImportData.jsx';

export default function App() {
  const [page, setPageState] = useState(() => window.location.hash.replace('#', '') || 'dashboard');

  function setPage(nextPage) {
    window.location.hash = nextPage;
    setPageState(nextPage);
  }

  useEffect(() => {
    const handler = () => setPageState(window.location.hash.replace('#', '') || 'dashboard');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const current = page === 'locations' ? <Locations /> : page === 'proposal' ? <ProposalBuilder /> : page === 'import' ? <ImportData setPage={setPage} /> : <Dashboard setPage={setPage} />;

  return <Layout page={page} setPage={setPage}>{current}</Layout>;
}
