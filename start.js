const fs = require('fs')
const NDE = require('node-nde');
const NodeID3 = require('node-id3')

const dat = 'main-yesterday.dat'; // backup file from \AppData\Roaming\Winamp\Plugins\ml
const idx = undefined;

const ndeReader = NDE.load(dat, idx);

const library = ndeReader.readAll();

const data = library
    .map(datum => {
        return {
            filename: datum.filename,
            title: datum.title,
            rating: datum.rating,
        }
    })
    .filter(datum => datum.rating !== undefined)
    .sort((a, b) => b.rating - a.rating)

const good = getUniqueListBy(data.filter(datum => datum.rating === 5), 'title').sort((a, b) => b.filename - a.filename);
const bad  = getUniqueListBy(data.filter(datum => datum.rating === 1), 'title').sort((a, b) => b.filename - a.filename);

const goodMissing = good.filter(({ filename }) => false === fs.existsSync(filename));
const badMissing  = bad.filter(({ filename }) => false === fs.existsSync(filename));

(async () => {
    const getRating = (filepath) => NodeID3.read(filepath, { include: 'popularimeter' });
    const setRating = (filepath, rating) => NodeID3.update( { popularimeter: { rating: rating * 51, email: 'email@example.com', counter: 0 } }, filepath, { include: 'popularimeter' });

    for (const index in good) {
        const datum = good[index];
        console.log('set 5', datum.filename)
        await setRating(datum.filename, 5);
    }
    for (const index in bad) {
        const datum = bad[index];
        console.log('set 0', datum.filename)
        await setRating(datum.filename, 0);
    }

    console.log('done')
})();

function getUniqueListBy(arr, key) {
    return arr.filter((v,i,a)=>a.findIndex(v2=>(v2[key]===v[key]))===i)
}