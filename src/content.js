// Portfolio content, mapped onto objects in the café model.
//
// nodes:   mesh names from lowpoly_cafe.glb that trigger this section
// viewDir: direction the camera looks at the object FROM (it gets normalized)
// zoom:    >1 pulls the camera further back, <1 moves it closer
// html:    what shows in the side panel

export const sections = [
  {
    id: 'about',
    label: 'About',
    tooltip: 'Read the sign',
    nodes: ['PortfolioSign', 'SignChalkboard', 'SignName', 'SignTitle', 'SignChalkDoodles'],
    viewDir: [0.7, 0.25, 0.7],
    zoom: 1.1,
    html: `
      <h2>Hi, I'm Ramina!</h2>
      <p class="kicker">Designer · Developer</p>
      <p>short intro<code>src/content.js</code>.</p>
    `,
  },
  {
    id: 'projects',
    label: 'Projects',
    tooltip: 'Look at the frames',
    nodes: ['PictureFrames'],
    viewDir: [1, 0.35, 0.45],
    zoom: 2.2,
    html: `
      <h2>Projects</h2>
      <article>
        <h3>Project one</h3>
        <p>Description</p>
        <a href="#" target="_blank" rel="noopener">View project →</a>
      </article>
      <article>
        <h3>Project two</h3>
        <p>Description</p>
        <a href="#" target="_blank" rel="noopener">View project →</a>
      </article>
    `,
  },
  {
    id: 'skills',
    label: 'Skills',
    tooltip: "Today's menu",
    nodes: ['Bakery', 'BakeryShelf'],
    viewDir: [0.1, 0.1, 1],
    zoom: 1,
    html: `
      <h2>On the menu</h2>
      <ul class="tags">
        <li>three.js</li><li>JavaScript</li><li>Blender</li><li>UI design</li>
      </ul>
    `,
  },
  {
    id: 'experience',
    label: 'Experience',
    tooltip: "What's brewing",
    nodes: ['EspressoMachine'],
    viewDir: [0.8, 1.1, 0.9],
    zoom: 1.5,
    html: `
      <h2>What's brewing</h2>
      <article>
        <h3>Role · Company</h3>
        <p class="kicker">2024 – now</p>
        <p>Description</p>
      </article>
    `,
  },
  {
    id: 'contact',
    label: 'Contact',
    tooltip: 'Grab a coffee',
    nodes: ['TableSetting', 'TableTop', 'BistroTable'],
    viewDir: [0.4, 0.9, 1],
    zoom: 1.3,
    html: `
      <h2>Grab a coffee?</h2>
      <p>I'm always happy to chat.</p>
      <p><a href="mailto:you@example.com">you@example.com</a></p>
      <p><a href="#" target="_blank" rel="noopener">GitHub</a> ·
         <a href="#" target="_blank" rel="noopener">LinkedIn</a></p>
    `,
  },
];
