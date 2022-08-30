import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider as StyletronProvider } from 'styletron-react'
import { Client as Styletron } from 'styletron-engine-atomic'
import { LightTheme, BaseProvider } from 'baseui'

const engine = new Styletron()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StyletronProvider value={engine} debugAfterHydration>
      <BaseProvider theme={LightTheme}>
        <App />
      </BaseProvider>
    </StyletronProvider>
  </React.StrictMode>
)
