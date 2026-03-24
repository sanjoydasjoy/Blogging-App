import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders brand logo', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  const logoElement = screen.getByText(/Scriptoria/i);
  expect(logoElement).toBeInTheDocument();
});
