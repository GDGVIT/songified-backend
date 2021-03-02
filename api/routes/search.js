const express = require('express');
const https = require("https");
const router = express.Router();

router.post('/song_and_artist',(req,res)=>{
    
        if(!req.body.song_name)
        {
            return res.status(400).json({
                error:"missing required parameters. refer documentation"
            });
        }

        if(!req.body.artist)
        {
            return res.status(400).json({
                error:"missing required parameters. refer documentation"
            });
        }

        const song_name = req.body.song_name.split(' ').join('+');
        const artist = req.body.artist.split(' ').join('+');
        const url = "https://api.getsongbpm.com/search/?api_key="+process.env.API_KEY+"&type=both&lookup=song:"+song_name+" artist:"+artist;

        https.get(url,(response)=>{
            console.log(url);
            console.log(response.statusCode);
            
            var body = '';

            response.on('data', function(data){
                body += data;
            });

            response.on("end",()=>
            {
                const song_data = JSON.parse(body);
                const song = song_data.search[0];
                console.log(song);
                const song_tempo = song.tempo;
                const song_key = song.key_of;
                const song_time_sig = song.time_sig;
                res.status(200).json({
                    details : 
                    {
                        song_tempo : song_tempo,
                        song_key : song_key,
                        song_time_sig : song_time_sig
                    }
                });
            });
            
        });
        



});


module.exports = router;