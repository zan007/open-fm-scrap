import mysql from "mysql";

export default class DatabaseConnector {
    constructor () {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: '',
            password: '',
            database: ''
        })
    }

    connect () {

    }

    disconnect () {

    }
}

/*
START TRANSACTION;

INSERT INTO station (name) VALUES ('Rocks');
INSERT INTO artist (name) VALUES ('Linkin Park');
INSERT INTO album (album_artist, name, year) values ((SELECT id_artist FROM artist WHERE name = 'Linkin Park'), 'Meteora', '1997');
INSERT INTO song (title, song_album) VALUES ('Numb', (SELECT id_album from album where name = 'Meteora'));
INSERT INTO song_station (id_song, id_station) VALUES ((SELECT id_song from song where title = 'Numb'), (SELECT id_station FROM STATION WHERE name = 'Rocks'));

COMMIT;
 */