export default function displayRippleEffect(e) {
  const el = e.currentTarget;
  const x = e.clientX - el.getBoundingClientRect().left;
  const y = e.clientY - el.getBoundingClientRect().top;

  const ripple = document.createElement('span');
  ripple.className = `block absolute rounded-full bg-black/40 w-[100px] h-[100px] -mt-[50px] -ml-[50px] animate-[rippleEffect_1s] opacity-0`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  el.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 300);
}