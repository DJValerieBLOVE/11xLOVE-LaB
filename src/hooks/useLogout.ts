import { useLoginActions } from './useLoginActions';

export function useLogout() {
  const { logout } = useLoginActions();
  return logout;
}
