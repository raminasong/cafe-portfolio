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
      <p class="kicker">Cognitive Science &amp; Data Science · UC Berkeley</p>
      <p>I build data pipelines, study how people make decisions, and design interfaces people
      enjoy using. Welcome to my café. Look around to get to know me!</p>
      <p><a href="./">See the full portfolio →</a></p>
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
        <h3>Teta: iOS meditation alarm</h3>
        <p class="kicker">React · Expo · AsyncStorage</p>
        <p>Pick a meditation the night before; one tap at the alarm starts it. Offline-first, beta tested with 5 users.</p>
      </article>
      <article>
        <h3>BARE Creative Magazine website</h3>
        <p class="kicker">Figma · React</p>
        <p>Led design and a 5-person dev team, including a 3D page-flip effect. Engagement up 25%.</p>
        <a href="https://baremagazine.org" target="_blank" rel="noopener">Visit the site →</a>
      </article>
      <article>
        <h3>Movie-genre classifier</h3>
        <p class="kicker">Python · machine learning</p>
        <p>k-NN on 5,000 word-frequency features from film dialogue, 70% test accuracy.</p>
      </article>
      <article>
        <h3>Computer-aided typing</h3>
        <p class="kicker">Python · algorithms</p>
        <p>Recursive string-similarity algorithms for autocorrect suggestions across large corpora.</p>
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
      <h3>Languages &amp; tools</h3>
      <ul class="tags">
        <li>Python</li><li>R</li><li>SQL</li><li>MySQL</li><li>Java</li><li>C/C++</li><li>Git</li><li>Excel</li>
      </ul>
      <h3>Data analysis</h3>
      <ul class="tags">
        <li>pandas</li><li>NumPy</li><li>Polars</li><li>ETL pipelines</li><li>Statistics</li><li>Data visualization</li><li>Machine learning</li>
      </ul>
      <h3>Design &amp; frontend</h3>
      <ul class="tags">
        <li>Figma</li><li>User testing</li><li>React</li><li>Next.js</li><li>Blender</li><li>Vercel</li>
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
        <h3>Research Assistant</h3>
        <p class="kicker">UC Berkeley Experimental Social Science Lab · June 2026 – now</p>
        <p>Built a pandas ETL pipeline over 290K+ participant records, cutting report turnaround 60%. Recruitment analysis raised signups 20%.</p>
      </article>
      <article>
        <h3>Web Director</h3>
        <p class="kicker">BARE Creative Magazine · Jan 2025 – now</p>
        <p>Lead a 5-person full-stack team from Figma mockups to production. Site engagement up 25%.</p>
      </article>
      <article>
        <h3>University Student Affairs Representative</h3>
        <p class="kicker">ASUC Senator Beardsley's Office · Sept 2025 – May 2026</p>
        <p>Turned feedback from 21,500+ students into policy insights, including housing reforms projected to cut transfer delays 25%.</p>
      </article>
      <article>
        <h3>Student Affairs Representative</h3>
        <p class="kicker">Associated Students of Irvine Valley College · Aug 2024 – May 2025</p>
        <p>Designed student surveys and launched a peer-support program for 40+ students.</p>
      </article>
      <p><a href="Ramina_Song_Resume.pdf" target="_blank" rel="noopener">Download my résumé →</a></p>
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
      <p>I'm always happy to chat about design, data, or a role you're hiring for.</p>
      <p><a href="mailto:raminasong@berkeley.edu">raminasong@berkeley.edu</a></p>
      <p><a href="https://www.linkedin.com/in/ramina-song-96b38a308/" target="_blank" rel="noopener">LinkedIn</a> ·
         <a href="https://github.com/raminasong" target="_blank" rel="noopener">GitHub</a> ·
         <a href="Ramina_Song_Resume.pdf" target="_blank" rel="noopener">Résumé</a></p>
    `,
  },
];
