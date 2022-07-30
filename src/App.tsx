import { css, Global } from '@emotion/react';
import { Route, Routes } from 'react-router-dom';
import Home from '@/components/Home';

const globalStyle = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 0;
    min-height: 100%;
    position: relative;
  }
`;

function App() {
  return (
    <>
      <Global styles={globalStyle} />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
