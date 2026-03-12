import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Language } from './pages/Language';
import { Logic } from './pages/Logic';
import { Habits } from './pages/Habits';
import { Art } from './pages/Art';
import { Science } from './pages/Science';
import { Culture } from './pages/Culture';
import { Story } from './pages/Story';
import { Animation } from './pages/Animation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/language" element={<Language />} />
        <Route path="/logic" element={<Logic />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/art" element={<Art />} />
        <Route path="/science" element={<Science />} />
        <Route path="/culture" element={<Culture />} />
        <Route path="/story" element={<Story />} />
        <Route path="/animation" element={<Animation />} />
      </Routes>
    </Router>
  );
}

export default App;
