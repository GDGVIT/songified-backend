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
            console.log(response.statusCode);
            
            var body = '';

            response.on('data', function(data){
                body += data;
            });

            response.on("end",()=>
            {
                const song_data = JSON.parse(body);
                if(song_data.search.error)
                {
                    return res.status(200).json({
                        error: song_data.search.error
                    });
                }
                const song = song_data.search[0];
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

router.post("/song",(req,res)=>{
    if(!req.body.song_name)
    {
        res.status(400).json({
            error: "missing required parameter. refer documentation"
        });
    }

    const song_name = req.body.song_name.split(' ').join('+');
    const url = "https://api.getsongbpm.com/search/?api_key="+process.env.API_KEY+"&type=song&lookup="+song_name;

    https.get(url,(response)=>{
        console.log(response.statusCode);

        var body = '';
        
        response.on("data",(data)=>{
            body +=data;
        });

        response.on("end",()=>{
            
            const song_data = JSON.parse(body);
            const song = song_data.search[0];
            
            const song_id = song.id;
        
            const url2 = "https://api.getsongbpm.com/song/?api_key="+process.env.API_KEY+"&id="+song_id;

            https.get(url2,(response)=>{
                console.log(response.statusCode);

                var body2='';

                response.on("data",(data)=>{
                    body2 += data;
                });

                response.on("end",()=>{

                    const song_details = JSON.parse(body2);
                    const all_details = song_details.song;
                    
                    const song_artist = all_details.artist.name;
                    const song_tempo = all_details.tempo;
                    const song_time_sig = all_details.time_sig;
                    const song_key = all_details.key_of;

                    res.status(200).json({
                        details : 
                        {
                            artist : song_artist,
                            song_tempo : song_tempo,
                            song_key : song_key,
                            song_time_sig : song_time_sig
                        }
                    });


                });
            });

        });

    });
});


module.exports = router;