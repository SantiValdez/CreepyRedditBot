require('dotenv').config({path: './process.env'});

const Snoowrap = require('snoowrap');

// Build Snoowrap client
const r = new Snoowrap({
    userAgent: 'notify people for scary askreddit posts v1.0 (by /u/HarryHayes)',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

r.config({requestDelay: 1000, continueAfterRatelimitError: true});

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
    "can't believe",
    "won't believe",
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
let totalUsers = 0;


setInterval( () =>{

    let allUrls = [];

    r.getSubreddit("Askreddit").getHot().then((posts) => {
        console.log("Scanning...");

        posts.forEach(element => {
            for(let i = 0; i < parameters.length; i++){
                if(element.title.toLowerCase().indexOf(parameters[i]) !== -1 && element.id !== "7i8ofx"){
                    if(relevantPosts.indexOf(element.url) === -1){
                        relevantPosts.push(element.url);
                    }
                }
            }
            allUrls.push(element.url);
        });

        //Remove posts that get pushed out so that they dont get sent to new users.
        for (let i = 0; i < relevantPosts.length; i++) {
            if(allUrls.indexOf(relevantPosts[i]) === -1){
                console.log("Removing - " + relevantPosts[i] + " - as it's not in the front-page anymore.");
                relevantPosts.splice(relevantPosts[i], 1);
            }
        }


        if(relevantPosts.length > 0){

            r.getSubmission('7efxig').expandReplies({limit:Infinity, depth: Infinity}).then(threadObj =>{
                threadObj.comments.forEach(comment =>{
                    if(!recordOfUsers.hasOwnProperty(comment.author.name.toString())){
                        recordOfUsers[comment.author.name] = [];
                        totalUsers++;
                    }

                    relevantPosts.forEach(post => {
                        if(recordOfUsers[comment.author.name].indexOf(post) === -1 && recordOfUsers[comment.author.name] !== '[deleted]'){
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
                        }
                    });
                });
            });

        }

        //get all unread PM's
        r.getInbox('messages').then(messages => {
            messages.forEach(message => {
                if(message.new){
                    unsubscribeParams.forEach(param => {
                        //if a message contains unsubscribe keyword look that user up in the thread and delete their comment
                        if(message.body.toLowerCase().indexOf(param) !== -1){
                            r.getSubmission('7efxig').expandReplies({limit:Infinity, depth: Infinity}).then(threadObj =>{
                                threadObj.comments.forEach(comment =>{
                                    if(comment.author.name === message.author.name){
                                        console.log("Deleted " + comment.author.name + "'s comment from the thread.");
                                        comment.remove();

                                        r.composeMessage({
                                            to: comment.author.name,
                                            subject: 'You have been unsubscribed. (CreepyAskredditBot)',
                                            text: "You have been unsubscribed from CreepyAskredditBot. You will not receive messaged anymore. \n\n"
                                            + "If you wish to subscribe again, just leave a comment on [this thread](https://www.reddit.com/r/CreepyAskredditBot/comments/7efxig/comment_here_to_get_notified_by_the_bot/)"
                                        }); 
                                    }
                                });
                            });
                            message.markAsRead();
                        }
                    });
                }//
            });
        });
    });
}, 15 * 60 * 1000); // every 15 minutes