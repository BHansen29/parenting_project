import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FormProvider } from '../context/FormContext';

export function renderWithRouter(ui, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <FormProvider>
        {ui}
      </FormProvider>
    </MemoryRouter>
  )
}