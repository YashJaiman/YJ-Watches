const TOAST_CONTAINER_ID = 'toast-container';

function createToastContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (container) return container;

  container = document.createElement('div');
  container.id = TOAST_CONTAINER_ID;
  container.style.position = 'fixed';
  container.style.right = '1rem';
  container.style.bottom = '1rem';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'flex-end';
  container.style.gap = '0.75rem';
  container.style.zIndex = '9999';
  document.body.appendChild(container);
  return container;
}

function formatToastElement(message, type) {
  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.justifyContent = 'space-between';
  toast.style.minWidth = '260px';
  toast.style.maxWidth = '360px';
  toast.style.padding = '1rem 1rem 1rem 1.1rem';
  toast.style.borderRadius = '18px';
  toast.style.color = '#eef2ff';
  toast.style.boxShadow = '0 0 32px rgba(56, 189, 248, 0.35), 0 18px 36px rgba(0,0,0,0.28)';
  toast.style.backdropFilter = 'blur(18px)';
  toast.style.fontSize = '0.95rem';
  toast.style.lineHeight = '1.6';
  toast.style.fontFamily = 'Inter, system-ui, sans-serif';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(24px)';
  toast.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
  toast.style.cursor = 'default';
  toast.style.border = '1px solid rgba(56, 189, 248, 0.25)';
  toast.style.position = 'relative';
  toast.style.overflow = 'hidden';

  const messageText = document.createElement('span');
  messageText.textContent = message;
  messageText.style.flex = '1';
  messageText.style.paddingRight = '0.75rem';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.innerHTML = '&times;';
  closeButton.style.border = 'none';
  closeButton.style.background = 'transparent';
  closeButton.style.color = '#cbd5e1';
  closeButton.style.fontSize = '1.1rem';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.margin = '0';
  closeButton.style.lineHeight = '1';
  closeButton.style.opacity = '0.9';
  closeButton.style.transition = 'color 0.2s ease, transform 0.2s ease';
  closeButton.setAttribute('aria-label', 'Dismiss notification');

  closeButton.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(24px)';
    toast.addEventListener(
      'transitionend',
      () => toast.remove(),
      { once: true }
    );
  });

  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.color = '#ffffff';
    closeButton.style.transform = 'scale(1.08)';
  });
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.color = '#cbd5e1';
    closeButton.style.transform = 'scale(1)';
  });

  if (type === 'error') {
    toast.style.background = 'rgba(163, 23, 23, 0.95)';
  } else if (type === 'success') {
    toast.style.background = 'rgba(6, 182, 212, 0.95)';
  } else {
    toast.style.background = 'rgba(2, 25, 56, 0.95)';
  }

  toast.appendChild(messageText);
  toast.appendChild(closeButton);

  return toast;
}

export function showToast(message, type = 'info', duration = 4500) {
  if (!message) return;
  const container = createToastContainer();
  const toast = formatToastElement(message, type);

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  globalThis.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(16px)';
    toast.addEventListener(
      'transitionend',
      () => {
        toast.remove();
      },
      { once: true }
    );
  }, duration);
}

export function showSuccess(message, duration) {
  showToast(message, 'success', duration);
}

export function showError(message, duration) {
  showToast(message, 'error', duration);
}
