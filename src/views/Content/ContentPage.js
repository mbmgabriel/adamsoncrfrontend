import React, { useEffect } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { FiBookOpen, FiChevronDown, FiHelpCircle, FiMessageCircle } from 'react-icons/fi';
import { CONTENT_PAGES_UNDER_DEVELOPMENT } from '../../config/features';
import { toast } from 'react-toastify';
import { getLandingPath } from '../../utils/userLanding';
import MainContainer from '../../components/Layout/MainContainer';
import { useSiteContent } from '../../context/SiteContentContext';
import '../../components/SiteContent/site-content.scss';

export default function ContentPage() {
  const { pathname } = useLocation();
  const isFaq = pathname === '/faqs';
  const rows = useSiteContent().filter(row => row.kind === (isFaq ? 'faq' : 'about'));
  const title = isFaq ? 'Frequently asked questions' : CONTENT_PAGES_UNDER_DEVELOPMENT ? 'About CRD' : rows[0]?.title || 'About CRD';
  const Icon = isFaq ? FiHelpCircle : FiBookOpen;
  useEffect(() => {
    if (CONTENT_PAGES_UNDER_DEVELOPMENT) toast.info(`${isFaq ? 'FAQs' : 'About CRD'} is under development.`);
  }, [isFaq]);
  if (CONTENT_PAGES_UNDER_DEVELOPMENT) return <Redirect to={getLandingPath(localStorage.getItem('role'))} />;
  return <MainContainer activeHeader={isFaq ? 'FAQs' : 'About CRD'}>
    <main className="published-page">
      <div className="published-page-panel">
        <header className="published-page-heading">
          <span className="published-icon"><Icon aria-hidden="true" /></span>
          <div><h1>{title}</h1>{isFaq && !CONTENT_PAGES_UNDER_DEVELOPMENT && <p>Answers to common questions about the research portal.</p>}</div>
        </header>
        {rows.length ? isFaq ? <div className="published-faq-list">{rows.map((row,index) => <details className="published-faq" key={row.id}>
          <summary><span className="published-faq-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><span className="published-faq-question">{row.title}</span><FiChevronDown aria-hidden="true" /></summary>
          <div className="published-faq-answer published-copy">{row.body}</div>
        </details>)}</div> : <div className="published-about">{rows.map(row => <article key={row.id}>{row.title.trim().toLowerCase() !== title.trim().toLowerCase() && <h2>{row.title}</h2>}<div className="published-copy">{row.body}</div></article>)}</div> :
          <div className="published-empty"><span className="published-empty-icon"><FiMessageCircle aria-hidden="true" /></span><h2>{isFaq ? 'No FAQs available yet' : 'More about CRD, coming soon'}</h2><p>{isFaq ? 'Published questions and answers will appear here.' : 'Information from the research center will appear here once published.'}</p></div>}
      </div>
    </main>
  </MainContainer>;
}
