import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Overview } from './screens/Overview';
import { Upload } from './screens/Upload';
import { Documents } from './screens/Documents';
import { Evidence } from './screens/Evidence';
import { Findings } from './screens/Findings';
import { Contradictions } from './screens/Contradictions';
import { Requirements } from './screens/Requirements';
import { Frameworks } from './screens/Frameworks';
import { AgentGovernance } from './screens/AgentGovernance';
import { ComingSoon } from './screens/ComingSoon';

export default function App() {
  return (
    <div className="flex h-screen bg-ink-900 text-fg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/findings" element={<Findings />} />
          <Route path="/contradictions" element={<Contradictions />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/frameworks" element={<Frameworks />} />
          <Route path="/agent-governance" element={<AgentGovernance />} />
          <Route
            path="/technical-translation"
            element={<ComingSoon title="Technical Translation" note="Regulation -> Control -> Technical Control -> Validation Method view is planned for the next slice." />}
          />
          <Route
            path="/reports"
            element={<ComingSoon title="Audit Report" note="Full exportable HTML/PDF audit report generation is planned for the next slice." />}
          />
        </Routes>
      </main>
    </div>
  );
}
