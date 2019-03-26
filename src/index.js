const DatabaseConnector = require('./services/database-connector');

const puppeteer = require('puppeteer');
const databaseConnector = new DatabaseConnector();
const url = 'https://open.fm';

scrapp = async () => {
    const browser = await puppeteer.launch({ slowMo: 300 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(url);

    const STATIONS_IDS = {
        ROCKS: {
            id: 77,
            name: 'Rocks'
        }
    };

    page.on('response', async (response) => {
        const url = response.url();
        try {
            if (url.search('https://open.fm/api/api-ext/v2/channels/') !== -1) {
                const responseJson = await response.json();

                await addChannelSongs(responseJson, STATIONS_IDS.ROCKS);
            }
        } catch (err) {
            console.error(`Failed getting data from: ${url}`);
            console.error(err);
        }
    });

    async function addChannelSongs (data, channelData) {
        const channel = data.channels.find((item) => item.id === channelData.id);

        const track = channel.tracks[0];
        console.log('channel', channel);
        //channel.tracks.forEach((track) => {
            const {song} = track;
            console.log('song', song);

            try {
                databaseConnector.transaction(`
                    INSERT INTO station (name) VALUES ('${channelData.name}');
                    INSERT INTO artist (name) VALUES ('${song.artist}');
                    INSERT INTO album (album_artist, name, year) values ((SELECT id_artist FROM artist WHERE name = '${song.artist}'), '${song.album.title}', '${song.album.year}');
                    INSERT INTO song (title, song_album) VALUES ('${song.title}', (SELECT id_album from album where name = '${song.album.title}'));
                    INSERT INTO song_station (id_song, id_station) VALUES ((SELECT id_song from song where title = '${song.title}'), (SELECT id_station FROM STATION WHERE name = '${channelData.name}'));
                `);
            } catch (err) {
                console.log('catch transaction', err);
            }
        //})
    }

    /*async function updateChannels (channels) {
        channels.map((channel) => {
            const station = stationData[channel.id];

            //INSERT INTO station (name) VALUES(${station.name}) ON DUPLICATE KEY UPDATE id_station = id_station

            updateSongs(channel.tracks, channel.id);
        });
    }

    async function updateSongs (tracks, stationId) {
        tracks.map((track) => {
            const {song} = track;

            console .log(song)
            // INSERT INTO artist (name) VALUES(${song.artist}
            // zapamietac lastInsertedArtistId
            // INSERT INTO album (year, album_artist) VALUES(${song.album.year}, ${lastInsertedArtistId})
            // zapamietac lastInsertedAlbumId
            // INSERT INTO song (title, song_album) VALUES(${song.title}, ${lastInsertedAlbumId})
            // INSERT INTO song_station (id_song,id_station) SELECT song.id_song, station.id_station FROM song INNER JOIN station ON 1=1
        })
    }

    const stationData = getStationData();

    async function getStationData () {
        return await page.evaluate(() => {
            const stationsMap = {};
            const stationItems = document.querySelectorAll('li[class="station-item"]');

            stationItems.forEach((stationItem) => {
                const stationId = stationItem.getAttribute('data-station-id');
                const stationDetailsElement = document.getElementsByClassName('station-details')[0];
                const stationNameElement = stationDetailsElement.getElementsByTagName('a')[0];
                const stationName = stationNameElement.getElementsByTagName('span').textContent;

                stationsMap[stationId] = stationName;
            });

            return stationsMap
        });
    }

    const songsData = await page.evaluate(() => {
        const songs = {};
        const stationItems = document.querySelectorAll('li[class="station-item"]');

        stationItems.forEach((stationItem) => {
            const stationId = stationItem.getAttribute('data-station-id');
            const stationDetailsElement = document.getElementsByClassName('station-details')[0];
            const stationNameElement = stationDetailsElement.getElementsByTagName('a')[0];
            const stationName = stationNameElement.getElementsByTagName('span').textContent;

            if (!songs[stationId]) {
                songs[stationId] = {
                    tracks: []
                }
            }

            const tracksListElement = stationDetailsElement.getElementsByClassName('tracks-list')[0];
            const tracksElements = tracksListElement.querySelectorAll('li');

            tracksElements.forEach((trackElement) => {
                const trackName = trackElement.getElementsByTagName('span')[0].textContent;
                const [artist, title] = trackName.split(' - ');
                songs[stationId].tracks.push({artist, title});
            });

        });

        return songs
    });*/
};

databaseConnector.connect();

scrapp();

