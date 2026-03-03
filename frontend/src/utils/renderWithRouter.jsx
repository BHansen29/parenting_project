import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FormProvider } from '../context/FormContext';

export function renderWithRouter(ui, { initialEntries = ['/'], initialState = {} } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <FormProvider initialState={initialState}>
        {ui}
      </FormProvider>
    </MemoryRouter>
  )
}