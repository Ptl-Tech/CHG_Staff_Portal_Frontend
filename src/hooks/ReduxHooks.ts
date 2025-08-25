// src/hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
// src/hooks/useAppSelector.ts
import { useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import type { TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch: () => AppDispatch = useDispatch;


export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
