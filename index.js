const express = require('express')
const axios=require('axios')
var abcd = [];

///firebase configaration for NodeJS
var admin = require("firebase-admin");
var serviceAccount = require("./web-bot-654d6-firebase-adminsdk-z95wv-bba6a2bcb7.json");// your firebase credential in this json file
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://my-projects-2525-default-rtdb.firebaseio.com/"
});
var contactFormDB = admin.database().ref('contactForm')


const app = express();
const port = process.env.PORT || 5000
app.listen(port, () => console.log('listening...'))
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

//sending answers to client
app.post('/api', async(request, response) => {
    const data = request.body.question;
    let abc =await findMatches(data);
    response.json(await abc);
})

//load firebase data to a array
contactFormDB.on("value", function (snapshot) {
    data = snapshot.val();
    abcd.pop();
    abcd.push(data);
})
//getting answer from google and firebase
async function findMatches(wordToMatch) {
    const regex = new RegExp(wordToMatch, 'gi');
    const googleSerach=await axios(`https://search-api-ss.herokuapp.com/query?search=${wordToMatch}&type=text`)
    const imageSerach=await axios(`https://search-api-ss.herokuapp.com/query?search=${wordToMatch}&type=images`)
    const googleData=await googleSerach.data
    const imageData=await imageSerach.data
    const data = abcd[0];
    for (let i in data) {
        if (data[i].question.match(regex)) {
            return {text:data[i].answer}
        }
    }
    return {text:await googleData.text[0],
            images: await imageData.images.slice(0,6)}
}

// app.post('/update', (request, response) => {
//     const data = request.body;
//     const id = data.id;
//     const url = 'contactForm/' + id;
//     delete data.id;
//     var jivi = admin.database().ref(url)
//     jivi.update(data);
//     response.json("Success")
// })

//add item
app.post('/addItem', (request, response) => {
    const d = new Date();
    const data=request.body;
    const fileData = {
        question: data.question,
        answer: data.answer,
        time: d.getTime()
    }
    var newContactForm = contactFormDB.push();
    newContactForm.set(fileData);
    response.json("Added");
})


app.get('/list',async(req,res)=>{
    res.json(await abcd[0])
})