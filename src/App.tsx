import { useState } from 'react'

import AIAgent from './components/aiAgent'
import './common/styles/main.less'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AIAgent />
    </>
  )
}

export default App
