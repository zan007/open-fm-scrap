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
                    reject(err);
                }

                return resolve();
            });
        })
    }

    disconnect () {
        return new Promise ((resolve, reject) => {
            this.connection.end((err) => {
                if (err) {
                    reject(err);
                }

                return resolve();
            });
        });
    }

    query (query) {
        return new Promise((resolve, reject) => {
            this.connection.query(query, (err, result, fields) => {
                if (err) {
                    reject(err);
                }

                console.log('query result', result);

                return resolve(result);
            })
        })
    }

    transaction (query) {
        return new Promise((resolve, reject) => {
            this.connection.beginTransaction((err) => {
                if (err) {
                    return this.connection.rollback(() => {
                        reject();
                    });
                }

                return this.query(query).then(() => {
                    return this.connection.commit((err) => {
                        if (err) {
                            return this.connection.rollback(() => {
                                reject();
                            });
                        }
                    })
                }, (err) => {
                    return this.connection.rollback(() => {
                        reject();
                    });
                })
            })
        });
    }
}

module.exports = DatabaseConnector;

/*
START TRANSACTION;

INSERT INTO station (name) VALUES ('Rocks');
INSERT INTO artist (name) VALUES ('Linkin Park');
INSERT INTO album (album_artist, name, year) values ((SELECT id_artist FROM artist WHERE name = 'Linkin Park'), 'Meteora', '1997');
INSERT INTO song (title, song_album) VALUES ('Numb', (SELECT id_album from album where name = 'Meteora'));
INSERT INTO song_station (id_song, id_station) VALUES ((SELECT id_song from song where title = 'Numb'), (SELECT id_station FROM STATION WHERE name = 'Rocks'));

COMMIT;
 */