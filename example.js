import figma_fetcher from './figmaDynamic.js';

figma_fetcher('sm')
.then (d => {
    console.log(JSON.stringify(d, null, 2));
})
.catch(e => console.error('Error fetching Figma details:', e));