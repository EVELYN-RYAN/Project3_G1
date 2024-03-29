/* Anna DeLange, Kylar Hobbs, Ryan Evelyn, Jackson Franks*/
const listenPort = 3333;

/* Requires */
let express = require("express");  

let path = require("path");

let app = express(); 

app.use(express.urlencoded({extended: true}));

// converts ejs format pages into html pages prior to returning them to browser
app.set("view engine","ejs");

/* initialize the web server on specified port */
app.listen(listenPort,function() {
    console.log("Listener active on port " + listenPort);
});

/*  set up the database connection via knex */
let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./musiclibrary.db"
    },
    useNullAsDefault: true
});

/* Routes */

app.get("/",function(req, res) {
    knex.from("Songs").select("*").orderBy("title","artist", "releaseYear")
        .then (songs => {
            console.log("Song: " + songs.length);
            res.render("index",{songs: songs});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({err});
    });
});

app.get('/addSong', (req,res) => {
    res.render('addSong');
});

app.post('/addSong',(req, res) => {
    console.log(req.body)
    knex('Songs').insert(req.body).then( songs => {
        res.redirect('/');  //change to a different route
    })      
});

app.get('/editSong/:id',(req, res) => {
    console.log(req.params.id)
    knex('Songs').where('id',req.params.id)
        .then(results => {
            console.log(results)
            res.render("editSong",{songs: results});
        }).catch(err => {
            console.log(err);
            res.status(500).json({err}); 
    });
});

app.post('/editSong',(req, res) => {
    knex('Songs').where({'id': req.body.SongId}).update({
        id: req.body.SongId, title: req.body.Title,
        artist: req.body.Artist, releaseYear: req.body.ReleaseYear })
        .then( hymn => { res.redirect('/'); })
}); 
    // deletesong is just a post
    app.post('/deleteSong/:id',(req, res) => {
        knex('Songs').where('id',req.params.id).del()
            .then(songs => {
                res.redirect('/');
            }).catch(err => {
                console.log(err);
                res.status(500).json({err}); 
            })
    });

    // Set page to original 
app.get('/addBatch', (req,res) =>{
    knex('Songs').insert(
        [
            {title: 'Bohemian Rhapsody', artist: 'QUEEN' , releaseYear: 1975},
            {title: "Don't Stop Believin'", artist: 'JOURNEY' , releaseYear: 1981},
            {title: 'Hey Jude', artist: 'THE BEATLES' , releaseYear: 1968},
        ]
    ).then(songs =>{
        res.redirect('/');
    });

});
// Initiate route to clearing all Rows
app.get('/startOver',(req,res) => {
    knex('Songs').del()
        .then(songs => {
            res.redirect ('/addBatch'); //redirect to adding originals
        }).catch(err => {
            console.log(err);
            res.status(500).json({err});
        })
});
