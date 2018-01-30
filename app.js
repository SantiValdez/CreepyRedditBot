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

r.config({requestDelay: 1000, warnings: false, continueAfterRatelimitError: true});

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
    "can't explain",
    "can't identify",
    "no one would believe",
    "unnerving",
    "eerie",
    "liminal",
    "unearthly",
    "otherworldly"
]

const unsubscribeParams = ["unsubscribe", "stop", "don't message", "dont message", "stop messaging"];

//store all posts that match parameters here to loop through later
let relevantPosts = [];
//keep a record of who got sent a message so that nobody gets spammed by accident
// key: user name value: relevant url
let recordOfUsers = {};
let removedUsers = []; //this is a temporary list of users that unsubbed to help avoid msging them right after unsubbing
let totalUsers = 0;





setInterval( () =>{
    totalUsers = 0;

    let allUrls = [];

    r.getSubreddit("Askreddit").getHot().then((posts) => {
        console.log("Scanning...");

        posts.forEach(element => {
            for(let i = 0; i < parameters.length; i++){
                if(element.title.toLowerCase().indexOf(parameters[i]) !== -1 && element.id !== '7tmsyq' && element.id !== '7tu4wj' && element.id !== '7tntyt'){
                    if(relevantPosts.indexOf(element.url) === -1){
                        relevantPosts.push(element.url);
                    }
                }
            }
            allUrls.push(element.url);
        });

        // Remove posts that get pushed out so that they dont get sent to new users.
        for (let i = 0; i < relevantPosts.length; i++) {
            if(allUrls.indexOf(relevantPosts[i]) === -1){
                console.log("Removing - " + relevantPosts[i] + " - as it's not in the front-page anymore.");
                relevantPosts.splice(relevantPosts[i], 1);
            }
        }


        if(relevantPosts.length > 0){
            r.getSubmission('7efxig').expandReplies({limit:Infinity, depth: Infinity}).then(threadObj =>{
                threadObj.comments.forEach(comment =>{
                    if(!comment.removed && comment.author.name !== "[deleted]"){
                        if(!recordOfUsers.hasOwnProperty(comment.author.name.toString())){
                            recordOfUsers[comment.author.name] = [];
                            totalUsers++;
                        }

                        relevantPosts.forEach(post => {
                            if(recordOfUsers[comment.author.name].indexOf(post) === -1 && 
                               recordOfUsers[comment.author.name] !== '[deleted]'      && 
                               removedUsers.indexOf(comment.author.name) === -1){
                                r.composeMessage({
                                    to: comment.author.name,
                                    subject: 'New creepy askreddit! (CreepyAskredditBot)',
                                    text: '**New creepy thread!** \n\n' + 
                                            post.toString() + "\n\n" +  
                                            '*if this thread has already been sent to you, [click here to know why](https://www.reddit.com/r/CreepyAskredditBot/comments/7eucv2/if_you_got_a_duplicate_message_heres_why/)* \n\n' +
                                            '**[^click ^here ^to ^stop ^receiving ^messages](https://www.reddit.com/r/CreepyAskredditBot/comments/7i0uh4/want_to_unsubscribe_read_here/)**'
                                });        
                                recordOfUsers[comment.author.name].push(post.toString()); 
                                console.log("Sent: " + post.toString() + "to: " + comment.author.name);
                                console.log(totalUsers);
                            }else{
                                console.log(comment.author.name + " has unsubbed recently or has already been sent the post."); //laziest most unhelpful log ever
                            }
                        });
                    }
                });
            });
        }

        // get all unread PM's
        r.getInbox('messages').then(messages => {
            messages.forEach(message => {
                if(message.new){
                    unsubscribeParams.forEach(param => {
                        //if a message contains unsubscribe keyword look that user up in the thread and delete their comment
                        if(message.body.toLowerCase().indexOf(param) !== -1){
                            r.getSubmission('7efxig').expandReplies({limit:Infinity, depth: Infinity}).then(threadObj =>{
                                threadObj.comments.forEach(comment =>{
                                    if(comment.author.name === message.author.name){
                                        if(recordOfUsers[comment.author.name] !== undefined){
                                            delete recordOfUsers[comment.author.name];
                                        }
                                        removedUsers.push(comment.author.name);
                                        console.log("Deleted " + comment.author.name + "'s comment from the thread.");
                                        comment.remove();
                                    }
                                });
                            });
                            r.getMessage(message.id).markAsRead();
                        }
                    });
                }
            });
        });
    });
}, 30 * 60 * 1000); // every 15 minutes  15 * 60 * 1000