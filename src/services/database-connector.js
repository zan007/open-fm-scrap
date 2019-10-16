const mysql = require('mysql');

class DatabaseConnector {
    constructor () {
        this.connection = mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            multipleStatements: true,
            database: 'open_fm_scrap'
        });
    }

    connect () {
        return new Promise ((resolve, reject) => {
            return this.connection.connect((err) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        })
    }

    disconnect () {
        return new Promise ((resolve, reject) => {
            this.connection.end((err) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    }

    query (query) {
        return new Promise((resolve, reject) => {
            this.connection.query(query, (err, result, fields) => {
                if (err) {
                    return reject(err);
                }

                console.log('query result', result);

                return resolve(result);
            })
        })
    }

    escape (data) {
        return this.connection.escape(data);
    }

    transaction (query) {
        return new Promise((resolve, reject) => {
            this.connection.beginTransaction((err) => {
                if (err) {
                    return this.connection.rollback(() => {
                        return reject(err);
                    });
                }

                return this.query(query).then(() => {
                    return this.connection.commit((err) => {
                        if (err) {
                            return this.connection.rollback(() => {
                                return reject(err);
                            });
                        }
                    })
                }, (err) => {
                    return this.connection.rollback(() => {
                        return reject(err);
                    });
                })
            })
        });
    }
}

module.exports = DatabaseConnector;

/*
START TRANSACTION;

INSERT INTO station (name) VALUES ('Rocks') ON DUPLICATE KEY UPDATE name = name;
INSERT INTO artist (name) VALUES ('Linkin Park') ON DUPLICATE KEY UPDATE name = name;
INSERT INTO album (album_artist, name, year) values ((SELECT id_artist FROM artist WHERE name = 'Linkin Park'), 'Meteora', '1997');
INSERT INTO song (title, song_album) VALUES ('Numb', (SELECT id_album from album where name = 'Meteora'));
INSERT INTO song_station (id_song, id_station) VALUES ((SELECT id_song from song where title = 'Numb'), (SELECT id_station FROM STATION WHERE name = 'Rocks'));

COMMIT;
 */

/*
INSERT INTO station (name) SELECT * FROM (SELECT 'Rocks') as tmp where not exists (select name from station where name='Rocks') limit 1;
INSERT INTO artist (name) SELECT * FROM (SELECT 'Linkin Park') as tmp where not exists (select name from artist where name = 'Linkin Park') limit 1;

INSERT INTO album (album_artist, name, year) SELECT * FROM (SELECT (SELECT id_artist FROM artist WHERE name = 'Linkin Park'), 'Meteora', '1997') as tmp where not exists (select name from album where name = 'Meteora') limit 1;
INSERT INTO song (title, song_album) VALUES ('Numb', (SELECT id_album from album where name = 'Meteora' limit 1));
INSERT INTO song_station (id_song, id_station) VALUES ((SELECT id_song from song where title = 'Numb' limit 1), (SELECT id_station FROM STATION WHERE name = 'Rocks' limit 1));
* */