import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Busca el texto "Bienvenido" (ignora mayúsculas/minúsculas)
    expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
  })
})