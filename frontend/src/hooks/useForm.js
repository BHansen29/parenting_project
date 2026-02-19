import { useContext } from 'react';
import { FormContext } from '../context/FormContext';

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used inside a FormProvider');
  }
  return context;
}