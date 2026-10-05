const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Two continuous rails align exactly at every frame boundary. Their bends and
// the additional freehand marks change from frame to frame, never repeating.
function continuingInk(index, right) {
  const x = right ? 1218 : -18;
  const direction = right ? -1 : 1;
  const rise = 118 + (index * 47) % 145;
  const second = 480 + (index * 59) % 130;
  const bulge = 24 + (index * 17 + (right ? 11 : 0)) % 48;
  const returnBulge = 18 + (index * 23 + (right ? 31 : 0)) % 43;
  return `M${x} -10 C${x + direction * bulge} ${rise - 90} ${x + direction * bulge} ${rise + 15} ${x} ${rise + 93} S${x + direction * returnBulge} ${second - 55} ${x + direction * returnBulge} ${second + 25} S${x} 790 ${x} 910`;
}

function freehandInk(index, right) {
  const edge = right ? 1218 : -18;
  const direction = right ? -1 : 1;
  const y = 190 + (index * 113) % 440;
  const reach = [3, 7, 10].includes(index) ? 390 : 65 + (index * 19) % 82;
  return `M${edge} ${y - 72} C${edge + direction * reach} ${y - 97} ${edge + direction * reach} ${y + 13} ${edge + direction * 28} ${y + 41} S${edge + direction * 11} ${y + 94} ${edge} ${y + 126}`;
}

const svgNamespace = 'http://www.w3.org/2000/svg';
const lineObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-ink-visible');
    lineObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.section').forEach((section, index) => {
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.setAttribute('class', 'section__lines');
  svg.setAttribute('viewBox', '0 0 1200 900');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const drawings = [
    { d: continuingInk(index, false), className: 'ink-primary' },
    { d: continuingInk(index, true), className: 'ink-primary' },
    { d: freehandInk(index, index % 3 === 0), className: 'ink-accent' }
  ];
  if (index % 4 === 2 || index % 4 === 3) {
    drawings.push({ d: freehandInk(index + 5, index % 2 === 0), className: 'ink-accent ink-soft' });
  }
  drawings.forEach((drawing) => {
    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute('d', drawing.d);
    path.setAttribute('class', drawing.className);
    svg.appendChild(path);
  });
  section.appendChild(svg);
  lineObserver.observe(section);
});
