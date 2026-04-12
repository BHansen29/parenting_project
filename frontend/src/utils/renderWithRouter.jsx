import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FormProvider } from '../context/FormContext'
import { NavigationProvider, useNavigation } from '../context/NavigationContext'
import Footer from '../components/common/Footer'

// Thin shell that wires the NavigationContext handlers into a Footer,
// exactly mirroring what Layout does in production.
function TestShell({ children }) {
  const { onNext, onBack } = useNavigation()
  return (
    <>
      {children}
      <Footer
        showBackButton
        showNextButton
        onBack={onBack}
        onNext={onNext}
      />
    </>
  )
}

export function renderWithRouter(ui, { initialEntries = ['/'], initialState = {} } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <FormProvider initialState={initialState}>
        <NavigationProvider>
          <TestShell>
            {ui}
          </TestShell>
        </NavigationProvider>
      </FormProvider>
    </MemoryRouter>
  )
}