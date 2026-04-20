import { useAppStore } from '../store/appStore';

export const useToast = () => {
  const { toast, setToast, clearToast } = useAppStore();
  
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(clearToast, 3500);
  };
  
  return { toast, showToast };
};