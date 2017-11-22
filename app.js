require('dotenv').config({path: './process.env'});

const Snoowrap = require('snoowrap');

// Build Snoowrap client
const r = new Snoowrap({
    userAgent: 'CreepyAskredditBot',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

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
    "misteriuous"
]

let relevantResults = [];
let recordOfUsers = {};


setInterval( () =>{
r.getSubreddit("Askreddit").getHot().then((posts) => {

    posts.forEach(element => {
        for(let i = 0; i < parameters.length; i++){
            if(element.title.toLowerCase().indexOf(parameters[i]) !== -1){
                console.log(element.title);
                if(relevantResults.indexOf(element.url) === -1){
                    relevantResults.push(element.url);
                }
            }
        }
    });

    if(relevantResults.length > 0){

        r.getSubmission('7efxig').expandReplies({limit:Infinity, depth: Infinity}).then(threadObj =>{
            threadObj.comments.forEach(comment =>{
                if(!recordOfUsers.hasOwnProperty(comment.author.name.toString())){
                    recordOfUsers[comment.author.name] = [];
                    console.log(recordOfUsers);
                }
            });

            relevantResults.forEach(result => {
                if(recordOfUsers[comment.author.name].indexOf(result) === -1){
                    r.composeMessage({
                        to: comment.author.name,
                        subject: 'New creepy askreddit! (CreepyAskredditBot)',
                        text: 'New creepy thread! \n\n' + 
                                result.toString() + "\n\n" +  
                                "*if this thread has already been sent to you, [click here to know why](https://www.reddit.com/r/CreepyAskredditBot/comments/7eucv2/if_you_got_a_duplicate_message_heres_why/)*"
                    });        
                    recordOfUsers[comment.author.name].push(result.toString());       
                }
            });
        });

    }
})}, 5000);