// Simple toast notification system
let toastContainer = null;

export const showToast = (message, type = 'success') => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-slide-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};

