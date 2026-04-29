import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Home } from './pages/Home';
import { useInteraction } from './hooks/useInteraction';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import { Login } from './pages/Login';

const Language = React.lazy(() => import('./pages/Language').then(m => ({ default: m.Language })));
const Logic = React.lazy(() => import('./pages/Logic').then(m => ({ default: m.Logic })));
const Habits = React.lazy(() => import('./pages/Habits').then(m => ({ default: m.Habits })));
const Art = React.lazy(() => import('./pages/Art').then(m => ({ default: m.Art })));
const Science = React.lazy(() => import('./pages/Science').then(m => ({ default: m.Science })));
const Culture = React.lazy(() => import('./pages/Culture').then(m => ({ default: m.Culture })));
const Story = React.lazy(() => import('./pages/Story').then(m => ({ default: m.Story })));
const Animation = React.lazy(() => import('./pages/Animation').then(m => ({ default: m.Animation })));

function PageLoader() {
  return <div className="h-full flex items-center justify-center text-text-light font-semibold animate-pulse">加载中…</div>;
}

function GlobalInteraction() {
  const { playPop, playDing } = useInteraction();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button') || 
                          target.closest('a') || 
                          target.closest('[role="button"]') || 
                          target.closest('.cursor-pointer');
      
      // 特殊按钮播放 ding
      if (target.closest('.clay-btn-cta') || target.closest('[data-action="reward"]')) {
        playDing();
      } else if (isClickable) {
        playPop();
      }
    };
    
    // 捕获阶段拦截点击
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [playPop, playDing]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalInteraction />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/" element={<Home />} />
            <Route path="/language" element={<Suspense fallback={<PageLoader />}><Language /></Suspense>} />
            <Route path="/logic" element={<Suspense fallback={<PageLoader />}><Logic /></Suspense>} />
            <Route path="/habits" element={<Suspense fallback={<PageLoader />}><Habits /></Suspense>} />
            <Route path="/art" element={<Suspense fallback={<PageLoader />}><Art /></Suspense>} />
            <Route path="/science" element={<Suspense fallback={<PageLoader />}><Science /></Suspense>} />
            <Route path="/culture" element={<Suspense fallback={<PageLoader />}><Culture /></Suspense>} />
            <Route path="/story" element={<Suspense fallback={<PageLoader />}><Story /></Suspense>} />
            <Route path="/animation" element={<Suspense fallback={<PageLoader />}><Animation /></Suspense>} />
          </Route>
          <Route path="*" element={<div className="flex h-screen items-center justify-center text-red-500">404 Not Found: {window.location.pathname}</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
