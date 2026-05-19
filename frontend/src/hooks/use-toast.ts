import React, { useContext } from "react";

// Dummy toast context for demonstration. Replace with your actual implementation.
const ToastContext = React.createContext({
  toasts: [], // Provide an empty array by default
  toast: (message: string) => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export const toast = (message: string) => {
  // Implement your toast logic here
  console.log("Toast:", message);
};
