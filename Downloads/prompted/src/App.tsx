import React from 'react';
import { GameProvider } from './context/GameContext';
import { GameOrchestrator } from './features/GameOrchestrator';
import { Shell } from './components/layout/Shell';

function App() {
    return (
        <GameProvider>
            <Shell>
                <GameOrchestrator />
            </Shell>
        </GameProvider>
    );
}

export default App;
