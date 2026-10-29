import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BranchHistoryPane } from '@/features/BranchHistory';

const root = document.getElementById('root');
if (!root) {
  throw new Error('The page has no #root element to render into');
}

createRoot(root).render(
  <StrictMode>
    <BranchHistoryPane />
  </StrictMode>,
);
