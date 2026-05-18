export function createSkeletonCard() {
  const skeleton = document.createElement('div');
  skeleton.classList.add('skeleton-card');

  skeleton.innerHTML = `
    <div class="skeleton-image"></div>
    <div class="skeleton-title"></div>
    <div class="skeleton-price"></div>
    <div class="skeleton-button"></div>
  `;

  return skeleton;
}

export function createSkeletonGrid(count = 6) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    fragment.appendChild(createSkeletonCard());
  }
  return fragment;
}
