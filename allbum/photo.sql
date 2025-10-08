CREATE DATABASE photo_album;

USE photo_album;

CREATE TABLE captions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    photo_path VARCHAR(255) NOT NULL UNIQUE,
    caption TEXT
);
