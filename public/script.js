const holder = document.getElementById('jivi')
const locator = document.getElementById('locator')
const container=document.getElementsByClassName('chat')[0]
const searchText=document.getElementById('searchText')
//speech sysnthesis
const msg = new SpeechSynthesisUtterance();
let voices = [];
//setLocalStorage
if (!localStorage.getItem('no')) {
    localStorage.setItem('no', 0)
} else {
    setTimeout(() => {
        let num = Number(localStorage.getItem('no'));
        msg.voice = voices[num];
    }, 1000)

}
//auto set show
const scrollToBottom = () => {
    locator.scrollIntoView({ behavior: "smooth" })
  }

//localstorage
if(localStorage.getItem("data")){
    container.innerHTML=localStorage.getItem("data")
    locator.scrollIntoView()
}
//recognition
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = 'en-US';

function generateQ(data){
    const q=document.createElement('div')
    q.textContent= data
    q.setAttribute('class','divRight')
    container.appendChild(q)
    searchText.value=""
    scrollToBottom()
}
function generateA(data){
    const q=document.createElement('div')
    q.textContent= data
    q.setAttribute('class','divLeft')
    container.appendChild(q)
    scrollToBottom()
}
function generateImg(images){
    const imgDiv=document.createElement('div')
    imgDiv.setAttribute('class','imgDiv')
    for(let i in images){
        const image=document.createElement('img')
        image.setAttribute('src',images[i])
        imgDiv.appendChild(image)
    }
    container.appendChild(imgDiv)
    scrollToBottom()
}
recognition.addEventListener('result', e => {
    speechSynthesis.cancel();
    const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
        searchText.value=transcript
    if (e.results[0].isFinal) {
        searchText.value=transcript
        generateQ(transcript)
        recognition.stop();
        holder.style.color = "black";
        holder.style.backgroundColor = "white";
        if (transcript == 'change the voice to Hindi' || transcript == 'change voice to Hindi') {
            msg.voice = voices[15];
            localStorage.setItem('no', 15)
            const data = "Sir voice is changed to hindi now"
            generateA(data)
            msg.text = data
            speechSynthesis.speak(msg);
        } else if (transcript == 'change the voice' || transcript == 'change voice') {
            let num = Number(localStorage.getItem('no'))
            num = (num % 15) + 1;
            msg.voice = voices[num];
            localStorage.setItem('no', num)
            const data = "Sir voice is changed now"
            generateA(data)
            msg.text = data
            speechSynthesis.speak(msg);
        } else if (transcript == 'change the voice to default' || transcript == 'change voice to default') {
            msg.voice = voices[0];
            localStorage.setItem('no', 0)
            const data = "Sir voice is changed now to default"
            generateA(data)
            msg.text = data
            speechSynthesis.speak(msg);
        } else if (transcript == "go to update log") {
            msg.text = "opening update log.."
            speechSynthesis.speak(msg);
            window.location.assign('./database.html');
        } else if (transcript == 'stop') {
            
        } else {
            speaker(transcript);
        }
    }
});

holder.addEventListener('mousedown', () => {
    recognition.start();
    holder.style.color = "white";
    holder.style.backgroundColor = "black";
});

//Ai Apeech system
recognition.onspeechend = function () {
    // recognition.stop();
    // speaker(p.textContent);
    // holder.style.color = "black";
    // holder.style.backgroundColor = "white";
    // console.log('Speech recognition has stopped.');
}

//for typing
searchText.addEventListener('keypress',(e)=>{
    if(e.keyCode==13){
        e.preventDefault()
        speaker(searchText.value)
        generateQ(searchText.value)
    }
})
async function speaker(a) {
    const test = {
        question: a
    }
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(test)
    };
    const response = await fetch('/api', options);
    const data = await response.json();
    generateA(data.text)
    msg.text = "geting data...";
    msg.text = data.text
    speechSynthesis.speak(msg);
    if(data.images){
        generateImg(data.images)
    }
    //limits to save data in localstorage
    if(container.children.length<=30){
        localStorage.setItem("data",container.innerHTML)
    }else{
        while(container.children.length>30){
            const deleteElement=container.firstElementChild
            container.removeChild(deleteElement)
        }
        localStorage.setItem("data",container.innerHTML)
    }
    
    
}

function populateVoices() {
    voices = this.getVoices();
}

speechSynthesis.addEventListener('voiceschanged', populateVoices);
