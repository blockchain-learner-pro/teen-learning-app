import { render, screen } from '@testing-library/react';
import App from './app/App';

test('renders the RPG-style intro UI', () => {
  render(<App />);

  expect(screen.getAllByText(/quiz battle/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/train your brain/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
});
