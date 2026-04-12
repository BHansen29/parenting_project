import { useCallback } from 'react';
import { useForm } from './useForm';

/*
  Custom hook to manage flag state for different sections of the form.
  Provides the current flag state and functions to toggle or set the flag.
*/
export function useSectionFlag(section) {
  const { state, dispatch } = useForm();

  const isFlagged = state.flags?.[section] ?? false;

  const toggleFlag = useCallback(() => {
    dispatch({
      type: 'UPDATE_FLAG',
      section: section,
      payload: !isFlagged
    });
  }, [dispatch, section, isFlagged]);

  const setFlag = useCallback((value) => {
    dispatch({
      type: 'UPDATE_FLAG',
      section: section,
      payload: Boolean(value)
    });
  }, [dispatch, section]);

  return { isFlagged, toggleFlag, setFlag };
}
