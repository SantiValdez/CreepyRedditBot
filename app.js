require('dotenv').config({path: './process.env'});

const Snoowrap = require('snoowrap');

// Build Snoowrap client
const r = new Snoowrap({
    userAgent: 'scary askreddit posts v1.1 (by /u/HarryHayes)',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

r.config({requestDelay: 1000, warnings: false, continueAfterRatelimitError: true, debug: false});

const parameters = [
    "creepy",
    "creepiest",
    "scary",
    "scariest",
    "paranormal",
    "unexplained",
    "spooky",
    "spookiest",
    "unsettling",
    "unsolved",
    "unresolved",
    "mystery",
    "mysterious",
    "urban legends",
    "urban legend",
    "supernatural",
    "unexplainable",
    "haunted",
    "haunting",
    "ufo",
    "glitch in the matrix",
    "terrifying",
    "macabre",
    "supertition",
    "superstitious",
    "strange experience",
    "strange experiences",
    "disturbing",
    "ghost",
    "ghostly",
    "cryptid",
    "demon",
    "demonic",
    "possession",
    "no one would believe",
    "unnerving",
    "eerie",
    "liminal",
    "unearthly",
    "otherworldly",
    "horror"
]

let alreadyPosted = [];

setInterval( () =>{

    r.getSubreddit("Askreddit").getHot().then((posts) => {
        
        console.log("Scanning...");
        
        posts.forEach(element => {
            let title = element.title.toLowerCase().split(' ');
            title.forEach(word =>{
                if(parameters.indexOf(word) !== -1
                && alreadyPosted.indexOf(element.id) === -1){
                    r.getSubreddit('CreepyBotStash').submitCrosspost({ 
                        title: element.title,
                        originalPost: element.id, 
                        sendReplies: false, 
                    });
                    alreadyPosted.push(element.id);
                    console.log("Crossposted: " + element.title);
                }
            });
        });
    });
}, 30 * 60 * 1000); //half hour