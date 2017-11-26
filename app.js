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
    "mysterious"
]

//store all posts that match parameters here to loop through later
let relevantPosts = [];
//keep a record of who got sent a message so that nobody gets spammed by accident
// key: user name value: relevant url
let recordOfUsers = {};


setInterval( () =>{
    r.getSubreddit("Askreddit").getHot().then((posts) => {
        console.log("Scanning...");

        posts.forEach(element => {
            for(let i = 0; i < parameters.length; i++){
                if(element.title.toLowerCase().indexOf(parameters[i]) !== -1){
                    if(relevantPosts.indexOf(element.url) === -1){
                        relevantPosts.push(element.url);
                    }
                }
            }
        });

        if(relevantPosts.length > 0){

            r.getSubmission('7efxig').expandReplies({limit:Infinity, depth: Infinity}).then(threadObj =>{
                threadObj.comments.forEach(comment =>{
                    if(!recordOfUsers.hasOwnProperty(comment.author.name.toString())){
                        recordOfUsers[comment.author.name] = [];
                    }

                    relevantPosts.forEach(post => {
                        if(recordOfUsers[comment.author.name].indexOf(post) === -1){
                            r.composeMessage({
                                to: comment.author.name,
                                subject: 'New creepy askreddit! (CreepyAskredditBot)',
                                text: '**New creepy thread!** \n\n' + 
                                        post.toString() + "\n\n" +  
                                        "*if this thread has already been sent to you, [click here to know why](https://www.reddit.com/r/CreepyAskredditBot/comments/7eucv2/if_you_got_a_duplicate_message_heres_why/)*"
                            });        
                            recordOfUsers[comment.author.name].push(post.toString()); 
                            console.log("Sent: " + post.toString() + "to: " + comment.author.name);
                        }
                    });
                });
            });

        }
    });
}, 15 * 60 * 1000); // every 15 minutes